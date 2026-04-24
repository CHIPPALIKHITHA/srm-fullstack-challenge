console.log("File started");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is working");
});

app.post("/bfhl", (req, res) => {
  const { data } = req.body;

  const invalid_entries = [];
  const valid_entries = [];
  const duplicate_edges = [];

  const seenEdges = new Set();
  const duplicateSet = new Set();
  const childParent = new Map();

  data.forEach((entry) => {
    const trimmedEntry = entry.trim();
    const pattern = /^[A-Z]->[A-Z]$/;

    if (!pattern.test(trimmedEntry)) {
      invalid_entries.push(entry);
      return;
    }

    const [parent, child] = trimmedEntry.split("->");

    if (parent === child) {
      invalid_entries.push(entry);
      return;
    }

    if (seenEdges.has(trimmedEntry)) {
      if (!duplicateSet.has(trimmedEntry)) {
        duplicate_edges.push(trimmedEntry);
        duplicateSet.add(trimmedEntry);
      }
      return;
    }

    if (childParent.has(child)) {
      return;
    }

    childParent.set(child, parent);
    seenEdges.add(trimmedEntry);
    valid_entries.push(trimmedEntry);
  });

  const childrenMap = {};
  const allNodes = new Set();
  const allParents = new Set();
  const allChildren = new Set();

  valid_entries.forEach((edge) => {
    const [parent, child] = edge.split("->");

    allNodes.add(parent);
    allNodes.add(child);
    allParents.add(parent);
    allChildren.add(child);

    if (!childrenMap[parent]) childrenMap[parent] = [];
    childrenMap[parent].push(child);
  });

  const visited = new Set();
  const components = [];

  function collectComponent(node, component) {
    if (component.has(node)) return;
    component.add(node);

    const children = childrenMap[node] || [];
    children.forEach((child) => collectComponent(child, component));

    valid_entries.forEach((edge) => {
      const [parent, child] = edge.split("->");
      if (child === node) collectComponent(parent, component);
    });
  }

  [...allNodes].forEach((node) => {
    if (!visited.has(node)) {
      const component = new Set();
      collectComponent(node, component);
      component.forEach((n) => visited.add(n));
      components.push(component);
    }
  });

  function hasCycleInComponent(component) {
    const visiting = new Set();
    const visitedNodes = new Set();

    function dfs(node) {
      if (visiting.has(node)) return true;
      if (visitedNodes.has(node)) return false;

      visiting.add(node);

      const children = childrenMap[node] || [];
      for (const child of children) {
        if (component.has(child) && dfs(child)) return true;
      }

      visiting.delete(node);
      visitedNodes.add(node);
      return false;
    }

    for (const node of component) {
      if (dfs(node)) return true;
    }

    return false;
  }

  function buildTree(node) {
    const tree = {};
    const children = childrenMap[node] || [];

    children.forEach((child) => {
      tree[child] = buildTree(child);
    });

    return tree;
  }

  function getDepth(node) {
    const children = childrenMap[node] || [];

    if (children.length === 0) return 1;

    return 1 + Math.max(...children.map((child) => getDepth(child)));
  }

  const hierarchies = [];

  components.forEach((component) => {
    const componentNodes = [...component].sort();
    const componentHasCycle = hasCycleInComponent(component);

    if (componentHasCycle) {
      hierarchies.push({
        root: componentNodes[0],
        tree: {},
        has_cycle: true,
      });
    } else {
      const roots = componentNodes.filter((node) => !allChildren.has(node));

      roots.forEach((root) => {
        hierarchies.push({
          root,
          tree: {
            [root]: buildTree(root),
          },
          depth: getDepth(root),
        });
      });
    }
  });

  const nonCyclicTrees = hierarchies.filter((h) => !h.has_cycle);
  const cyclicGroups = hierarchies.filter((h) => h.has_cycle);

  let largest_tree_root = "";

  if (nonCyclicTrees.length > 0) {
    largest_tree_root =
      nonCyclicTrees.sort((a, b) => {
        if (b.depth !== a.depth) return b.depth - a.depth;
        return a.root.localeCompare(b.root);
      })[0]?.root || "";
  }

  res.json({
    user_id: "chippalikhitha_01072005",
    email_id: "cl6961@srmist.edu.in",
    college_roll_number: "RA2311003010325",
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees: nonCyclicTrees.length,
      total_cycles: cyclicGroups.length,
      largest_tree_root,
    },
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});