#! /usr/bin/env node

var mod_fs = require('fs');
var mod_path = require('path');
var mod_rr = require('railroad-diagrams');

var Choice = mod_rr.Choice;
var Diagram = mod_rr.Diagram;
var NonTerminal = mod_rr.NonTerminal;
var OneOrMore = mod_rr.OneOrMore;
var Optional = mod_rr.Optional;
var Sequence = mod_rr.Sequence;
var Terminal = mod_rr.Terminal;
var ZeroOrMore = mod_rr.ZeroOrMore;

var destdir = mod_path.join(__dirname, '..', 'docs', 'media', 'img');
var svgheader = [
    '<?xml version="1.0" encoding="utf-8" standalone="no"?>',
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"' +
    ' "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
    '<svg xmlns="http://www.w3.org/2000/svg"' +
    ' xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" $1>',
    '<defs><style type="text/css"><![CDATA[',
    'svg.railroad-diagram path {',
    '  stroke-width: 3;',
    '  stroke: black;',
    '  fill: none;',
    '}',
    'svg.railroad-diagram text {',
    '  font: bold 14px monospace;',
    '  text-anchor: middle;',
    '}',
    'svg.railroad-diagram text.label {',
    '  text-anchor: start;',
    '}',
    'svg.railroad-diagram text.comment {',
    '  font: italic 12px monospace;',
    '}',
    'svg.railroad-diagram rect {',
    '  stroke-width: 3;',
    '  stroke: black;',
    '  fill: hsl(120,100%,90%);',
    '}',
    ' ]]></style></defs>'
].join('\n');


var ruleDiagram = Diagram(
  Terminal('FROM'),
  NonTerminal('target_list'),
  Terminal('TO'),
  NonTerminal('target_list'),
  Choice(0,
    Terminal('ALLOW'),
    Terminal('BLOCK')),
  NonTerminal('protocol'),
  Optional(
    Sequence(Terminal('PRIORITY'), NonTerminal('priolevel')), 'skip'));

var targetListDiagram = Diagram(
    Choice(0,
        Terminal('ANY'),
        Terminal('ALL VMS'),
        Sequence(
            Terminal('('),
            OneOrMore(NonTerminal('target'), Terminal('OR')),
            Terminal(')')),
        NonTerminal('target')));

var targetDiagram = Diagram(
    Choice(0,
        Sequence(Terminal('IP'), NonTerminal('address')),
        Sequence(Terminal('SUBNET'), NonTerminal('cidr')),
        Sequence(Terminal('TAG'), NonTerminal('tag_string')),
        Sequence(
          Terminal('TAG'), NonTerminal('tag_string'),
          Terminal('='),
          NonTerminal('tag_value')),
        Sequence(Terminal('VM'), NonTerminal('uuid'))));

var protoDiagram = Diagram(
    Choice(0,
        Sequence(Terminal('TCP'), NonTerminal('port_list')),
        Sequence(Terminal('UDP'), NonTerminal('port_list')),
        Sequence(Terminal('ICMP'), NonTerminal('type_list')),
        Sequence(Terminal('ICMP6'), NonTerminal('type_list')),
        Terminal('AH'),
        Terminal('ESP')));

var portListDiagram = Diagram(
    Choice(0,
        Sequence(
            Terminal('('),
            OneOrMore(
                Sequence(Terminal('PORT'), NonTerminal('port')),
                Terminal('AND')),
            Terminal(')')),
        Sequence(Terminal('PORTS'), OneOrMore(NonTerminal('portrange'), Terminal(','))),
        Terminal('PORT ALL')));

var typeListDiagram = Diagram(
    Choice(0,
        Sequence(
            Terminal('('),
            OneOrMore(Sequence(
            Terminal('TYPE'),
            Terminal('0 - 255'),
            Optional(Sequence(Terminal('CODE'), Terminal('0 - 255')))), Terminal('AND')),
            Terminal(')')),
        Terminal('TYPE ALL')));

function writeDiagram(diag, filename) {
    var p = mod_path.join(destdir, filename);
    var s = diag.format().toString().replace(/<svg ([^>]*)>/, svgheader);

    mod_fs.writeFileSync(p, s);
}

writeDiagram(ruleDiagram, 'rule.svg');
writeDiagram(targetListDiagram, 'target-list.svg');
writeDiagram(targetDiagram, 'target.svg');
writeDiagram(protoDiagram, 'protocol.svg');
writeDiagram(portListDiagram, 'port-list.svg');
writeDiagram(typeListDiagram, 'type-list.svg');
