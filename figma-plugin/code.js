figma.showUI(__html__, { width: 260, height: 120 });

function summarizeNode(node) {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    x: "x" in node ? node.x : undefined,
    y: "y" in node ? node.y : undefined,
    width: "width" in node ? node.width : undefined,
    height: "height" in node ? node.height : undefined,
  };
}

function getNodeOrThrow(nodeId) {
  const node = figma.getNodeById(nodeId);
  if (!node) throw new Error(`node not found: ${nodeId}`);
  return node;
}

function resolveParent(parentId) {
  if (!parentId) return figma.currentPage;
  const parent = getNodeOrThrow(parentId);
  if (!("appendChild" in parent)) throw new Error(`node cannot have children: ${parentId}`);
  return parent;
}

const CREATE_FNS = {
  RECTANGLE: () => figma.createRectangle(),
  ELLIPSE: () => figma.createEllipse(),
  LINE: () => figma.createLine(),
  TEXT: () => figma.createText(),
  FRAME: () => figma.createFrame(),
};

function createNode(type, params) {
  const fn = CREATE_FNS[type];
  if (!fn) throw new Error(`unsupported type: ${type}`);
  const node = fn();
  resolveParent(params.parentId).appendChild(node);
  node.x = params.x;
  node.y = params.y;
  if ((params.width !== undefined || params.height !== undefined) && "resize" in node) {
    node.resize(params.width ?? node.width, params.height ?? node.height);
  }
  if (params.name) node.name = params.name;
  return { nodeId: node.id };
}

// Properties settable directly (no async prerequisite).
const DIRECT_PROPS = [
  "x", "y", "name", "opacity", "cornerRadius", "fills", "strokes",
  "layoutMode", "itemSpacing",
  "paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
  "primaryAxisSizingMode", "counterAxisSizingMode",
];

async function applyProps(node, props) {
  for (const key of Object.keys(props)) {
    if (key === "width" || key === "height" || key === "characters" || key === "fontSize") continue;
    if (!DIRECT_PROPS.includes(key)) throw new Error(`unsupported property: ${key}`);
    if (!(key in node)) throw new Error(`${node.type} has no property: ${key}`);
    node[key] = props[key];
  }

  if ("width" in props || "height" in props) {
    if (!("resize" in node)) throw new Error(`${node.type} cannot be resized`);
    node.resize(props.width ?? node.width, props.height ?? node.height);
  }

  if ("characters" in props || "fontSize" in props) {
    if (node.type !== "TEXT") throw new Error("characters/fontSize only apply to TEXT nodes");
    await figma.loadFontAsync(node.fontName);
    if ("characters" in props) node.characters = props.characters;
    if ("fontSize" in props) node.fontSize = props.fontSize;
  }
}

function moveNode(nodeId, params) {
  const node = getNodeOrThrow(nodeId);
  if (params.parentId !== undefined) {
    const parent = resolveParent(params.parentId);
    if (params.index !== undefined) parent.insertChild(params.index, node);
    else parent.appendChild(node);
  }
  if (params.x !== undefined) node.x = params.x;
  if (params.y !== undefined) node.y = params.y;
  return summarizeNode(node);
}

async function handleOp(op, params) {
  switch (op) {
    case "get_status":
      return {
        fileKey: figma.fileKey,
        pageName: figma.currentPage.name,
        pageId: figma.currentPage.id,
      };

    case "get_selection":
      return figma.currentPage.selection.map(summarizeNode);

    case "get_node_tree": {
      const root = params.nodeId ? figma.getNodeById(params.nodeId) : figma.currentPage;
      if (!root) throw new Error(`node not found: ${params.nodeId}`);
      if (!("children" in root)) {
        return { id: root.id, name: root.name, type: root.type, children: [] };
      }
      return {
        id: root.id,
        name: root.name,
        type: root.type,
        children: root.children.map((child) => ({
          id: child.id,
          name: child.name,
          type: child.type,
          visible: child.visible,
        })),
      };
    }

    case "create_node":
      return createNode(params.type, params);

    case "set_node_property": {
      const node = getNodeOrThrow(params.nodeId);
      await applyProps(node, params.props || {});
      return summarizeNode(node);
    }

    case "move_node":
      return moveNode(params.nodeId, params);

    default:
      throw new Error(`unknown op: ${op}`);
  }
}

figma.ui.onmessage = async (msg) => {
  if (!msg || !msg.id) return;
  try {
    const result = await handleOp(msg.op, msg.params || {});
    figma.ui.postMessage({ id: msg.id, ok: true, result });
  } catch (err) {
    figma.ui.postMessage({ id: msg.id, ok: false, error: err.message });
  }
};
