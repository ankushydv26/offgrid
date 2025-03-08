"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [nodes, setNodes] = useState([]);
  const [text, setText] = useState('');
  const [meaning, setMeaning] = useState('');
  const [relatedSentences, setRelatedSentences] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    const res = await fetch('http://localhost:5000/nodes');
    const data = await res.json();
    setNodes(data);
  };

  const addNode = async () => {
    const res = await fetch('http://localhost:5000/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, meaning, relatedSentences: relatedSentences.split(',') })
    });
    if (res.ok) {
      fetchNodes();
      setText('');
      setMeaning('');
      setRelatedSentences('');
    }
  };

  const askAI = async () => {
    const res = await fetch('http://localhost:5000/ai-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    setAiResponse(data.answer);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Node-Based Text Storage</h1>
      <div className="mt-4">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Text" className="border p-2 mr-2" />
        <input value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="Meaning" className="border p-2 mr-2" />
        <input value={relatedSentences} onChange={(e) => setRelatedSentences(e.target.value)} placeholder="Related Sentences (comma separated)" className="border p-2 mr-2" />
        <button onClick={addNode} className="bg-blue-500 text-white p-2">Add Node</button>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Nodes</h2>
        {nodes.map(node => (
          <div key={node._id} onClick={() => setSelectedNode(node)} className="cursor-pointer p-2 border mt-2">
            {node.text}
          </div>
        ))}
        {selectedNode && (
          <div className="mt-4 p-4 border">
            <h3 className="text-lg font-bold">{selectedNode.text}</h3>
            <p><strong>Meaning:</strong> {selectedNode.meaning}</p>
            <p><strong>Related Sentences:</strong> {selectedNode.relatedSentences.join(', ')}</p>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Ask AI</h2>
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question..." className="border p-2 mr-2 w-full" />
        <button onClick={askAI} className="bg-green-500 text-white p-2 mt-2">Get AI Response</button>
        {aiResponse && (
          <div className="mt-4 p-4 border bg-gray-100">
            <h3 className="text-lg font-bold">AI Response:</h3>
            <p>{aiResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}
