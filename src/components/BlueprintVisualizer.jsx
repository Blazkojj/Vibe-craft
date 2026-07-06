import React, { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Code, Terminal, Server, Zap, File as FileIcon, Settings, Code2 } from 'lucide-react';

// Custom Node for Zenexcode Blueprints
const CustomNode = ({ data }) => {
  return (
    <div style={{
      background: '#2b2a29',
      border: `1px solid ${data.color || '#3e3d3b'}`,
      borderRadius: '8px',
      padding: '12px',
      minWidth: '200px',
      color: '#e5e1d8',
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', borderBottom: '1px solid #3e3d3b', paddingBottom: '8px' }}>
        <div style={{ color: data.color || '#da7756' }}>
          {data.icon === 'cmd' && <Terminal size={16} />}
          {data.icon === 'logic' && <Code size={16} />}
          {data.icon === 'api' && <Server size={16} />}
          {data.icon === 'event' && <Zap size={16} />}
          {data.icon === 'config' && <Settings size={16} />}
          {data.icon === 'java' && <Code2 size={16} />}
          {!data.icon && <Box size={16} />}
        </div>
        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{data.label}</div>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#a39e99', lineHeight: '1.4' }}>
        {data.description}
      </div>
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

function BlueprintVisualizer({ messages }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!messages) return;

    // Parse all files from messages
    const filesMap = {};
    messages.forEach(msg => {
      const text = msg.text || '';
      const regex = /<file path="([^"]+)">/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        filesMap[match[1]] = true; // just existence
      }
    });

    const filePaths = Object.keys(filesMap);
    
    if (filePaths.length === 0) {
      setNodes([{
        id: '1', type: 'custom', position: { x: 50, y: 50 },
        data: { label: 'Brak struktury', description: 'Poproś AI o kod, aby wygenerować architekturę.', color: '#a39e99' }
      }]);
      setEdges([]);
      return;
    }

    const newNodes = [];
    const newEdges = [];

    // Root node
    newNodes.push({
      id: 'root', type: 'custom', position: { x: 300, y: 50 },
      data: { label: 'Projekt Pluginu', description: 'Główny korzeń', icon: 'api', color: '#10b981' }
    });

    let yOffset = 150;
    let xOffset = 50;

    filePaths.forEach((path, idx) => {
      const nodeId = `file-${idx}`;
      
      let icon = 'logic';
      let color = '#3b82f6';
      
      if (path.endsWith('.yml')) {
        icon = 'config';
        color = '#f59e0b';
      } else if (path.endsWith('.java')) {
        icon = 'java';
        color = '#da7756';
      } else if (path.endsWith('pom.xml')) {
        icon = 'config';
        color = '#8b5cf6';
      }

      const filename = path.split('/').pop() || path;
      const desc = path.length > 30 ? '...' + path.slice(-27) : path;

      newNodes.push({
        id: nodeId, type: 'custom', position: { x: xOffset, y: yOffset },
        data: { label: filename, description: desc, icon, color }
      });

      newEdges.push({
        id: `e-root-${nodeId}`, source: 'root', target: nodeId, animated: true, style: { stroke: color, strokeWidth: 2 }
      });

      xOffset += 240;
      if (xOffset > 600) {
        xOffset = 50;
        yOffset += 150;
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);

  }, [messages, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#1c1b1a' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls style={{ background: '#2b2a29', borderColor: '#3e3d3b', fill: '#e5e1d8' }} />
        <MiniMap 
          nodeColor={(n) => {
            return n.data?.color || '#3e3d3b';
          }}
          style={{ background: '#2b2a29', border: '1px solid #3e3d3b' }}
          maskColor="rgba(0,0,0,0.5)"
        />
        <Background color="#3e3d3b" gap={16} />
      </ReactFlow>
    </div>
  );
}

export default BlueprintVisualizer;
