#!/bin/env python

import json


def readGraphJson(json_file, extra_attr):

    file = open(json_file)
    obj = json.load(file)
    file.close()

    fiedler = obj["r1"]
    adj = obj["adj"]
    labels = obj["nByi"]
    attrs = {}
    for attr in extra_attr:
      attrs[attr] = obj[attr]
    return fiedler, adj, labels, attrs
    

def rectifyGraphs(graph1, graph2):

  nodes_obj = []
  nodes = []
  extra_ind = len(graph1[2])
  graph2_fiedler = [0] * extra_ind
  label_map = {}

  for index2 in range(0,len(graph2[2])):  # for all nodes in second graph
    val = graph2[2][index2]  # label of node in second graph
    if val in graph1[2]:  # if node is also in first graph
      index1 = graph1[2].index(val)
      obj = dict({ 'x' : graph1[0][index1], 'y' :  graph2[0][index2], 'id' : val })
      graph1_objs = {}
      for key in graph1[3]:
          graph1_objs.update({key: graph1[3][key][index1]})
      graph2_objs = {}
      for key in graph2[3]:
          graph2_objs.update({key: graph2[3][key][index2]})
      obj.update({"graph1": graph1_objs})
      obj.update({"graph2": graph2_objs})
      nodes_obj.append(obj)  #keep the node
      nodes.append(val)

  adj = []
  from sets import Set
  used_nodes = Set()
   
  for index1 in range(0, len(graph1[1]) ):  # for all edges in first graph
    val = graph1[1][index1]
    source = val[0]
    target = val[1]
    weight = float(val[2])
    if (graph1[2][source] in nodes and graph1[2][target] in nodes):   # if label of nodes is in the new array
      new_source = nodes.index(graph1[2][source])
      new_target = nodes.index(graph1[2][target])
      adj.append([new_source, new_target, weight, 1]) # keep it
      used_nodes.add(new_source)
      used_nodes.add(new_target)

  for index2 in range(0, len(graph2[1]) ):  # for all edges in second graph
    val = graph2[1][index2]
    source = val[0]
    target = val[1]
    weight = float(val[2])
    if (graph2[2][source] in nodes and graph2[2][target] in nodes):   # if label of nodes is in the new array
      new_source = nodes.index(graph2[2][source])
      new_target = nodes.index(graph2[2][target])
      adj.append([new_source, new_target, weight, 2]) # keep it
      used_nodes.add(new_source)
      used_nodes.add(new_target)

#   print "Shrinking node array.\n Current size: ", len(nodes_obj)
#   filtered_nodes = [ nodes_obj[index] for index in range(0, len(nodes_obj) ) if index in used_nodes ]
#   print "Shrunk to: " ,len(filtered_nodes)

#   return { "nodes" : filtered_nodes, "edges" : adj}
  return { "nodes" : nodes_obj, "edges" : adj}


def parse_parameters():
    import argparse
    parser = argparse.ArgumentParser(description = 'Subset Feature Matrix by samples according to fold definition and specified fold/repetition')
    parser.add_argument('--graph1', nargs = '?' , required=True,
                            help = 'input first json graph file. e.g. /path/to/data/graph1.json')
    parser.add_argument('--graph2', nargs = '?' , required=True,
                            help = 'input second json graph file. e.g. /path/to/data/graph2.json')
    parser.add_argument('--output', nargs = '?', required=True,
                            help = 'output json graph file. e.g. /path/to/output/graph.json')

    return parser.parse_args()



def main():
    args = parse_parameters()
    graph1 = readGraphJson(args.graph1, ['f1'])
    graph2 = readGraphJson(args.graph2, ['f1'])
    fullGraph = rectifyGraphs(graph1, graph2)

    output = open(args.output, "w")
    json.dump(fullGraph, output)
    
    print "end"


if __name__ == '__main__':
    main()