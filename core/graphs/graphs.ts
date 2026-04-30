class Graph {
  private node: number
  private edges: Map<number, number[]>

  constructor(node: number) {
    this.node = node
    this.edges = new Map()
  }

  addVertex(vertex: number) {
    this.edges.set(vertex, [])
  }

  addEdge(vertex1: number, vertex2: number) {
    this.edges.get(vertex1)?.push(vertex2)
    this.edges.get(vertex2)?.push(vertex1)
  }
}

const graph = new Graph(5)
graph.addVertex(0)
graph.addVertex(1)
graph.addVertex(2)
graph.addVertex(3)
graph.addVertex(4)
graph.addEdge(0, 1)
graph.addEdge(0, 2)
graph.addEdge(1, 2)
graph.addEdge(1, 3)
graph.addEdge(2, 4)
graph.addEdge(3, 4)
console.log(graph)
