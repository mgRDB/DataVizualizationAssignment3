import pandas as pd
import networkx as nx
import matplotlib.pyplot as plt
import json
from networkx.readwrite import json_graph

df = pd.read_csv("data_scopus.csv")

nodes = pd.DataFrame({"ID":[],"Name":[],"Country":[],"Affiliation":[],"Group":[]})
node = []

df = df[['Authors', 'Author(s) ID','Authors with affiliations']]
df.dropna(inplace=True)
df = df.reset_index()

Ctry = pd.DataFrame({"C":[]})
for i in range(len(df)):
    cy = df['Authors with affiliations'][i].split(";")
    for j in range(len(cy)):
        Ctry.loc[len(Ctry)] = [cy[j].split(",")[-1].strip()]
Ctry = Ctry.value_counts().head(10).index.to_list()
top = []
for i in range(10):
    top.append(Ctry[i][0])


links = []
for i in range(len(df)):
    ids = df['Author(s) ID'][i]
    ids = ids[:-1].split(";")
    for j in range(len(ids)):
        for k in range(j+1,len(ids)):
            links.append((ids[j],ids[k]))
        aid = ids[j]
        aname = df['Authors'][i][:-1].split(",")[j]
        acountry = df['Authors with affiliations'][i].split(";")[j].split(",")[-1].strip()
        aaff = df['Authors with affiliations'][i].split(";")[j]
        agroup = 0
        for l in range(10):
            if acountry == top[l]:
                agroup = l + 1
        if aid not in nodes['ID'].values:
            nodes.loc[len(nodes)] = [aid, aname, acountry, aaff, agroup]
            node.append((aid,{"Name":aname,"Country":acountry,"Affiliation":aaff,"Group":agroup}))
links = list(set(links))

G = nx.Graph()
G.add_nodes_from(node)
G.add_edges_from(links)
pos = nx.drawing.circular_layout(G)
nx.draw(G, pos=pos, node_size = 10)

# plt.show()

with open('author.json','w') as f:
    json.dump(json_graph.node_link_data(G),f)