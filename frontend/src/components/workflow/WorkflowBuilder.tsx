/**
 * AI Manus Unified - Workflow Builder
 * =====================================
 * Visual workflow builder using React Flow.
 * Provides drag-and-drop canvas for creating AI-powered workflows.
 * 
 * @author AI Manus Unified Team
 * @license MIT
 */

import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  NodeTypes,
  MarkerType,
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

// =============================================================================
// Types
// =============================================================================

interface SkillParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
  options?: string[];
}

interface SkillOutput {
  name: string;
  type: string;
  description: string;
}

interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: SkillParameter[];
  outputs: SkillOutput[];
  icon: string;
  color: string;
}

interface WorkflowNodeData {
  label: string;
  skillId?: string;
  skill?: SkillDefinition;
  parameters: Record<string, any>;
  status?: 'pending' | 'running' | 'success' | 'failed';
  outputs?: Record<string, any>;
}

interface WorkflowBuilderProps {
  initialNodes?: Node<WorkflowNodeData>[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node<WorkflowNodeData>[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onExecute?: (workflow: { nodes: Node[]; edges: Edge[] }) => void;
  skills?: SkillDefinition[];
  readOnly?: boolean;
}

// =============================================================================
// Custom Node Component
// =============================================================================

const SkillNode: React.FC<{ data: WorkflowNodeData; selected?: boolean }> = ({ 
  data, 
  selected 
}) => {
  const statusColors = {
    pending: '#94a3b8',
    running: '#3b82f6',
    success: '#22c55e',
    failed: '#ef4444',
  };

  const statusIcon = {
    pending: '⏳',
    running: '🔄',
    success: '✅',
    failed: '❌',
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        background: data.skill?.color || '#6366f1',
        color: 'white',
        minWidth: '180px',
        boxShadow: selected 
          ? '0 0 0 2px #fff, 0 0 0 4px #3b82f6' 
          : '0 2px 8px rgba(0,0,0,0.15)',
        border: `2px solid ${statusColors[data.status || 'pending']}`,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '8px',
      }}>
        <span style={{ fontSize: '20px' }}>
          {data.status ? statusIcon[data.status] : (data.skill?.icon || '⚙️')}
        </span>
        <span style={{ 
          fontWeight: 600, 
          fontSize: '14px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {data.label}
        </span>
      </div>

      {/* Skill Info */}
      {data.skill && (
        <div style={{ 
          fontSize: '11px', 
          opacity: 0.9,
          marginBottom: '4px',
        }}>
          {data.skill.category.replace(/_/g, ' ').toUpperCase()}
        </div>
      )}

      {/* Parameters Preview */}
      {Object.keys(data.parameters).length > 0 && (
        <div style={{ 
          fontSize: '10px', 
          opacity: 0.8,
          marginTop: '8px',
          padding: '4px 8px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '4px',
        }}>
          {Object.entries(data.parameters).slice(0, 2).map(([key, value]) => (
            <div key={key} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {key}: {typeof value === 'string' ? value.slice(0, 20) : JSON.stringify(value).slice(0, 20)}
            </div>
          ))}
          {Object.keys(data.parameters).length > 2 && (
            <div>+{Object.keys(data.parameters).length - 2} more</div>
          )}
        </div>
      )}

      {/* Handles */}
      <div
        style={{
          position: 'absolute',
          left: -8,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#fff',
          border: '2px solid #6366f1',
        }}
        className="react-flow__handle react-flow__handle-left"
      />
      <div
        style={{
          position: 'absolute',
          right: -8,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#fff',
          border: '2px solid #6366f1',
        }}
        className="react-flow__handle react-flow__handle-right"
      />
    </div>
  );
};

// =============================================================================
// Skill Panel Component
// =============================================================================

const SkillPanel: React.FC<{
  skills: SkillDefinition[];
  onDragStart: (skill: SkillDefinition) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}> = ({ skills, onDragStart, selectedCategory, onCategoryChange }) => {
  const categories = useMemo(() => {
    const cats = new Set(skills.map(s => s.category));
    return Array.from(cats);
  }, [skills]);

  const filteredSkills = useMemo(() => {
    if (!selectedCategory) return skills;
    return skills.filter(s => s.category === selectedCategory);
  }, [skills, selectedCategory]);

  return (
    <div style={{
      width: '280px',
      background: '#1e1e2e',
      borderRight: '1px solid #313244',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #313244',
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '16px', 
          color: '#cdd6f4',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          🧩 Skills Library
        </h2>
      </div>

      {/* Category Filter */}
      <div style={{
        padding: '8px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        borderBottom: '1px solid #313244',
      }}>
        <button
          onClick={() => onCategoryChange(null)}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: 'none',
            background: !selectedCategory ? '#89b4fa' : '#313244',
            color: !selectedCategory ? '#1e1e2e' : '#cdd6f4',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: selectedCategory === cat ? '#89b4fa' : '#313244',
              color: selectedCategory === cat ? '#1e1e2e' : '#cdd6f4',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            {cat.replace(/_/g, ' ').split(' ').map(
              w => w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ')}
          </button>
        ))}
      </div>

      {/* Skills List */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '8px',
      }}>
        {filteredSkills.map(skill => (
          <div
            key={skill.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('skill', JSON.stringify(skill));
              onDragStart(skill);
            }}
            style={{
              padding: '12px',
              marginBottom: '8px',
              borderRadius: '8px',
              background: '#313244',
              cursor: 'grab',
              border: '1px solid #45475a',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#45475a';
              e.currentTarget.style.borderColor = skill.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#313244';
              e.currentTarget.style.borderColor = '#45475a';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
            }}>
              <span style={{ fontSize: '18px' }}>{skill.icon}</span>
              <span style={{ 
                fontWeight: 600, 
                color: '#cdd6f4',
                fontSize: '13px',
              }}>
                {skill.name}
              </span>
            </div>
            <div style={{
              fontSize: '11px',
              color: '#a6adc8',
              lineHeight: '1.4',
            }}>
              {skill.description.slice(0, 60)}...
            </div>
            <div style={{
              marginTop: '8px',
              display: 'flex',
              gap: '4px',
            }}>
              {skill.parameters.slice(0, 3).map(p => (
                <span
                  key={p.name}
                  style={{
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: p.required ? '#f38ba8' : '#45475a',
                    color: p.required ? '#1e1e2e' : '#cdd6f4',
                  }}
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// Node Configuration Panel
// =============================================================================

const NodeConfigPanel: React.FC<{
  node: Node<WorkflowNodeData> | null;
  skill: SkillDefinition | undefined;
  onUpdate: (nodeId: string, parameters: Record<string, any>) => void;
  onClose: () => void;
}> = ({ node, skill, onUpdate, onClose }) => {
  const [params, setParams] = useState<Record<string, any>>({});

  useEffect(() => {
    if (node) {
      setParams(node.data.parameters || {});
    }
  }, [node]);

  if (!node || !skill) return null;

  const handleParamChange = (name: string, value: any) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdate(node.id, params);
    onClose();
  };

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: '320px',
      height: '100%',
      background: '#1e1e2e',
      borderLeft: '1px solid #313244',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #313244',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{ margin: 0, color: '#cdd6f4', fontSize: '14px' }}>
          {skill.icon} {skill.name}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#cdd6f4',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          ✕
        </button>
      </div>

      {/* Parameters */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px',
      }}>
        <div style={{ 
          fontSize: '12px', 
          color: '#a6adc8',
          marginBottom: '16px',
        }}>
          {skill.description}
        </div>

        {skill.parameters.map(param => (
          <div key={param.name} style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: '#cdd6f4',
              marginBottom: '4px',
            }}>
              {param.name}
              {param.required && <span style={{ color: '#f38ba8' }}> *</span>}
            </label>
            
            {param.type === 'string' && !param.options && (
              <input
                type="text"
                value={params[param.name] || param.default || ''}
                onChange={(e) => handleParamChange(param.name, e.target.value)}
                placeholder={param.description}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #45475a',
                  background: '#313244',
                  color: '#cdd6f4',
                  fontSize: '12px',
                }}
              />
            )}

            {param.type === 'string' && param.options && (
              <select
                value={params[param.name] || param.default || ''}
                onChange={(e) => handleParamChange(param.name, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #45475a',
                  background: '#313244',
                  color: '#cdd6f4',
                  fontSize: '12px',
                }}
              >
                {param.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {param.type === 'integer' && (
              <input
                type="number"
                value={params[param.name] || param.default || 0}
                onChange={(e) => handleParamChange(param.name, parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #45475a',
                  background: '#313244',
                  color: '#cdd6f4',
                  fontSize: '12px',
                }}
              />
            )}

            {param.type === 'boolean' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={params[param.name] ?? param.default ?? false}
                  onChange={(e) => handleParamChange(param.name, e.target.checked)}
                />
                <span style={{ fontSize: '12px', color: '#a6adc8' }}>
                  {param.description}
                </span>
              </label>
            )}

            {(param.type === 'object' || param.type === 'array') && (
              <textarea
                value={JSON.stringify(params[param.name] || param.default || {}, null, 2)}
                onChange={(e) => {
                  try {
                    handleParamChange(param.name, JSON.parse(e.target.value));
                  } catch {}
                }}
                placeholder={param.description}
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #45475a',
                  background: '#313244',
                  color: '#cdd6f4',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
            )}

            <div style={{ fontSize: '10px', color: '#6c7086', marginTop: '4px' }}>
              {param.description}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #313244',
      }}>
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: 'none',
            background: '#89b4fa',
            color: '#1e1e2e',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// Main Workflow Builder Component
// =============================================================================

const WorkflowBuilderInner: React.FC<WorkflowBuilderProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onExecute,
  skills = [],
  readOnly = false,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node<WorkflowNodeData> | null>(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');

  // Node types
  const nodeTypes: NodeTypes = useMemo(() => ({
    skill: SkillNode,
  }), []);

  // Handle new connection
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) =>
      addEdge(
        {
          ...connection,
          type: 'smoothstep',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        eds
      )
    );
  }, [setEdges]);

  // Handle drop
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const skillData = event.dataTransfer.getData('skill');
    if (!skillData) return;

    const skill: SkillDefinition = JSON.parse(skillData);
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode: Node<WorkflowNodeData> = {
      id: `node_${Date.now()}`,
      type: 'skill',
      position,
      data: {
        label: skill.name,
        skillId: skill.id,
        skill,
        parameters: {},
        status: 'pending',
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [screenToFlowPosition, setNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node click
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node as Node<WorkflowNodeData>);
  }, []);

  // Handle node update
  const handleNodeUpdate = useCallback((nodeId: string, parameters: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, parameters } }
          : node
      )
    );
  }, [setNodes]);

  // Handle execute
  const handleExecute = useCallback(() => {
    if (onExecute) {
      onExecute({ nodes, edges });
    }
  }, [nodes, edges, onExecute]);

  // Notify parent of changes
  useEffect(() => {
    if (onNodesChange) {
      onNodesChange(nodes as Node<WorkflowNodeData>[]);
    }
  }, [nodes, onNodesChange]);

  useEffect(() => {
    if (onEdgesChange) {
      onEdgesChange(edges);
    }
  }, [edges, onEdgesChange]);

  return (
    <div style={{ display: 'flex', height: '100%', background: '#11111b' }}>
      {/* Skill Panel */}
      <SkillPanel
        skills={skills}
        onDragStart={() => {}}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={readOnly ? undefined : onNodesChangeInternal}
          onEdgesChange={readOnly ? undefined : onEdgesChangeInternal}
          onConnect={readOnly ? undefined : onConnect}
          onDrop={readOnly ? undefined : onDrop}
          onDragOver={readOnly ? undefined : onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#313244" />
          <Controls style={{ background: '#1e1e2e', borderRadius: '8px' }} />
          <MiniMap
            style={{ background: '#1e1e2e' }}
            nodeColor={(node) => node.data?.skill?.color || '#6366f1'}
          />

          {/* Toolbar */}
          <Panel position="top-center">
            <div style={{
              display: 'flex',
              gap: '8px',
              background: '#1e1e2e',
              padding: '8px 16px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cdd6f4',
                  fontSize: '14px',
                  fontWeight: 600,
                  width: '200px',
                }}
              />
              <button
                onClick={handleExecute}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#a6e3a1',
                  color: '#1e1e2e',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ▶ Run Workflow
              </button>
              <button
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #45475a',
                  background: 'transparent',
                  color: '#cdd6f4',
                  cursor: 'pointer',
                }}
              >
                💾 Save
              </button>
              <button
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #45475a',
                  background: 'transparent',
                  color: '#cdd6f4',
                  cursor: 'pointer',
                }}
              >
                📤 Export
              </button>
            </div>
          </Panel>
        </ReactFlow>

        {/* Node Configuration Panel */}
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            skill={selectedNode.data.skill}
            onUpdate={handleNodeUpdate}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
};

// =============================================================================
// Export with Provider
// =============================================================================

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowBuilder;