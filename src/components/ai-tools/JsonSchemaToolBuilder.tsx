"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon, DownloadIcon, PlusIcon, TrashIcon } from "lucide-react";

type PropertyType = "string" | "number" | "boolean" | "array" | "object";

interface SchemaProperty {
  id: string;
  name: string;
  type: PropertyType;
  description: string;
  required: boolean;
}

export function JsonSchemaToolBuilder() {
  const [funcName, setFuncName] = useState("get_weather");
  const [funcDesc, setFuncDesc] = useState("Get the current weather in a given location");
  const [properties, setProperties] = useState<SchemaProperty[]>([
    { id: "1", name: "location", type: "string", description: "The city and state, e.g. San Francisco, CA", required: true },
    { id: "2", name: "unit", type: "string", description: "The unit of temperature, either 'celsius' or 'fahrenheit'", required: false },
  ]);
  const [rawMode, setRawMode] = useState(false);
  const [rawJson, setRawJson] = useState('{\n  "location": "San Francisco, CA",\n  "unit": "celsius"\n}');
  const [copied, setCopied] = useState(false);

  const addProperty = () => {
    setProperties([...properties, { id: Math.random().toString(), name: `prop_${properties.length + 1}`, type: "string", description: "", required: false }]);
  };

  const updateProperty = (id: string, field: keyof SchemaProperty, value: any) => {
    setProperties(properties.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeProperty = (id: string) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  // Helper to infer basic JSON schema from raw JSON
  const inferSchema = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
      
      const props: any = {};
      const req: string[] = [];
      
      for (const [key, value] of Object.entries(parsed)) {
        const type = typeof value;
        props[key] = {
          type: type === "object" ? (Array.isArray(value) ? "array" : "object") : type,
          description: `Auto-inferred from sample value: ${value}`
        };
        req.push(key);
      }
      return { properties: props, required: req };
    } catch {
      return null;
    }
  };

  const generateOutput = () => {
    let schemaProps: any = {};
    let schemaRequired: string[] = [];

    if (rawMode) {
      const inferred = inferSchema(rawJson);
      if (inferred) {
        schemaProps = inferred.properties;
        schemaRequired = inferred.required;
      }
    } else {
      properties.forEach(p => {
        if (p.name.trim()) {
          schemaProps[p.name.trim()] = {
            type: p.type,
            description: p.description
          };
          if (p.required) schemaRequired.push(p.name.trim());
        }
      });
    }

    const schema = {
      type: "function",
      function: {
        name: funcName.trim() || "my_function",
        description: funcDesc.trim() || "A helpful function",
        parameters: {
          type: "object",
          properties: schemaProps,
          ...(schemaRequired.length > 0 && { required: schemaRequired })
        }
      }
    };

    return JSON.stringify(schema, null, 2);
  };

  const outputCode = generateOutput();
  let isValid = true;
  if (rawMode) {
    try { JSON.parse(rawJson); } catch { isValid = false; }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputCode], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tool-schema.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start w-full">
      <div className="card p-6 bg-card/60 shadow-sm border-line/40 space-y-6">
        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">Function Name</label>
          <input 
            type="text" className="input w-full bg-field border-line focus:border-accent"
            value={funcName} onChange={e => setFuncName(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">Function Description</label>
          <textarea 
            className="input w-full min-h-[80px] bg-field border-line focus:border-accent"
            value={funcDesc} onChange={e => setFuncDesc(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between border-t border-line/40 pt-6 mb-2">
          <label className="text-sm font-bold text-fg">Parameters</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Raw JSON Mode</span>
            <button 
              role="switch"
              aria-checked={rawMode}
              onClick={() => setRawMode(!rawMode)}
              className={`w-10 h-5 rounded-full p-1 transition-colors ${rawMode ? "bg-accent" : "bg-line/50"}`}
            >
              <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${rawMode ? "translate-x-4.5" : "translate-x-0"}`}></div>
            </button>
          </div>
        </div>

        {rawMode ? (
          <div>
            <p className="text-xs text-muted mb-2">Paste a sample JSON payload and we will auto-infer the types.</p>
            <textarea
              className={`input w-full min-h-[200px] bg-field font-mono text-sm ${!isValid ? "border-danger focus:border-danger" : "border-line focus:border-accent"}`}
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
            />
            {!isValid && <p className="text-xs text-danger mt-1">Invalid JSON syntax</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map(p => (
              <div key={p.id} className="p-4 rounded-lg bg-hover/50 border border-line/50 relative">
                <button onClick={() => removeProperty(p.id)} className="absolute top-2 right-2 text-muted hover:text-danger p-1">
                  <TrashIcon className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-muted mb-1 block">Name</label>
                    <input type="text" className="input w-full h-8 text-sm" value={p.name} onChange={e => updateProperty(p.id, "name", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted mb-1 block">Type</label>
                    <select className="input w-full h-8 text-sm" value={p.type} onChange={e => updateProperty(p.id, "type", e.target.value)}>
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="array">array</option>
                      <option value="object">object</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted mb-1 block">Description</label>
                  <input type="text" className="input w-full h-8 text-sm" value={p.description} onChange={e => updateProperty(p.id, "description", e.target.value)} />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input type="checkbox" id={`req-${p.id}`} checked={p.required} onChange={e => updateProperty(p.id, "required", e.target.checked)} className="accent-accent" />
                  <label htmlFor={`req-${p.id}`} className="text-xs text-fg">Required field</label>
                </div>
              </div>
            ))}
            <button onClick={addProperty} className="btn btn-secondary w-full text-sm py-2 flex justify-center items-center gap-2">
              <PlusIcon className="w-4 h-4" /> Add Property
            </button>
          </div>
        )}
      </div>

      <div className="card bg-hover/30 border-line/30 flex flex-col h-[600px] sticky top-24">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line/40 bg-card/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted">tool-schema.json</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="btn btn-secondary py-1 px-2.5 text-xs h-auto min-h-0 flex items-center gap-1.5" title="Copy to clipboard">
              {copied ? <CheckIcon className="w-3.5 h-3.5 text-success" /> : <CopyIcon className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={handleDownload} className="btn btn-primary py-1 px-2.5 text-xs h-auto min-h-0 flex items-center gap-1.5" title="Download JSON">
              <DownloadIcon className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-black/40 text-sm font-mono text-fg/90 whitespace-pre-wrap">
          {outputCode}
        </div>
      </div>
    </div>
  );
}
