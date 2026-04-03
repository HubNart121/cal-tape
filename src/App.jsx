import { useRef, useEffect } from 'react'
import html2canvas from 'html2canvas-pro'
import { Calculator, Download, Plus, Trash2, FolderOpen, Menu, X } from 'lucide-react'
import { useProjectStore } from './store/projectStore'
import { useState } from 'react'

function App() {
  const { 
    projects, 
    activeProjectId, 
    addProject, 
    setActiveProject, 
    updateActiveProject, 
    deleteProject,
    getActiveProject
  } = useProjectStore()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const cardRef = useRef(null)

  // Auto-init first project if empty
  useEffect(() => {
    if (projects.length === 0) {
      addProject('Project 1')
    }
  }, [projects, addProject])

  const activeProject = getActiveProject()

  // Prevent crash if rendering before project init
  if (!activeProject) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>

  // Local handles for 2-way binding updating store
  const handlePriceRollChange = (val) => {
    const pRoll = parseFloat(val)
    let pSqm = ''
    
    if (!isNaN(pRoll) && activeProject.width && activeProject.length) {
      const area = (activeProject.width * activeProject.length) / 1000
      if(area > 0) pSqm = pRoll / area
    }
    
    updateActiveProject({ 
      priceRoll: isNaN(pRoll) ? '' : pRoll, 
      priceSqm: pSqm === '' ? '' : pSqm 
    })
  }

  const handlePriceSqmChange = (val) => {
    const pSqm = parseFloat(val)
    let pRoll = ''
    
    if (!isNaN(pSqm) && activeProject.width && activeProject.length) {
      const area = (activeProject.width * activeProject.length) / 1000
      if(area > 0) pRoll = pSqm * area
    }
    
    updateActiveProject({ 
        priceSqm: isNaN(pSqm) ? '' : pSqm, 
        priceRoll: pRoll === '' ? '' : pRoll 
    })
  }
  
  const handleParamChange = (field, val) => {
      const numVal = parseFloat(val)
      const dataToUpdate = { [field]: isNaN(numVal) ? '' : numVal }
      
      // Attempt to re-calculate priceSqm if priceRoll is valid
      const tempWidth = field === 'width' ? numVal : activeProject.width
      const tempLength = field === 'length' ? numVal : activeProject.length
      
      if(tempWidth && tempLength && !isNaN(activeProject.priceRoll) && activeProject.priceRoll !== '') {
          const area = (tempWidth * tempLength) / 1000
          if(area > 0) {
              dataToUpdate.priceSqm = activeProject.priceRoll / area
          }
      }
      
      updateActiveProject(dataToUpdate)
  }

  const exportImage = async () => {
    if (!cardRef.current) return
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#020617', 
        useCORS: true
      })
      const link = document.createElement('a')
      link.download = `${activeProject.name || 'tape-price'}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
      alert("Failed to export image")
    }
  }

  const area = (activeProject.width && activeProject.length) ? ((activeProject.width * activeProject.length) / 1000).toFixed(4) : 0

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      
      {/* Sidebar / Drawer */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <div className="flex items-center space-x-2">
                <FolderOpen className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-slate-200">My Projects</h2>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
                <X className="w-5 h-5" />
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {projects.map(p => (
                <div 
                    key={p.id} 
                    onClick={() => { setActiveProject(p.id); setIsSidebarOpen(false) }}
                    className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors group ${p.id === activeProjectId ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' : 'bg-slate-800/20 hover:bg-slate-800/60 border border-transparent text-slate-300'}`}
                >
                    <div className="truncate pr-2 font-medium flex-1">
                        {p.name}
                    </div>
                    {projects.length > 1 && (
                        <button 
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
        </div>

        <div className="p-4 border-t border-slate-800">
            <button 
                onClick={() => addProject(`Project ${projects.length + 1}`)}
                className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-lg font-medium transition-colors cursor-pointer border border-slate-700"
            >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
            </button>
        </div>
      </div>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto w-full relative">
        <div className="md:hidden p-4 flex items-center absolute top-0 left-0 w-full z-20 pointer-events-none">
            <button onClick={() => setIsSidebarOpen(true)} className="pointer-events-auto p-2 bg-slate-900 border border-slate-800 rounded-lg shadow-lg text-slate-300 hover:text-white">
                <Menu className="w-5 h-5" />
            </button>
        </div>

        <div className="flex-1 flex flex-col items-center py-12 px-4">
            {/* Header */}
            <div className="w-full max-w-md mb-8 text-center space-y-2 mt-4 md:mt-0">
                <div className="inline-flex items-center justify-center p-3 bg-blue-600/20 rounded-full mb-2">
                    <Calculator className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Tape Price Tool</h1>
                <p className="text-slate-400 text-sm">สูตร 2 ทาง (ม้วน ⇄ ตร.ม.) • บันทึกอัตโนมัติ</p>
            </div>

            {/* Main Card (Target for Export) */}
            <div 
                ref={cardRef}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
                {/* Glassmorphism decoration */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-blue-600/10 blur-2xl pointer-events-none"></div>
                
                <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                        <div>
                            <input 
                                className="text-xl font-semibold bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 focus:outline-none transition-colors w-full text-white placeholder-slate-600"
                                value={activeProject.name}
                                onChange={(e) => updateActiveProject({ name: e.target.value })}
                                placeholder="Project Name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400">Width (mm.)</label>
                            <input 
                                type="number" 
                                value={activeProject.width} 
                                onChange={(e) => handleParamChange('width', e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-lg"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400">Length (m.)</label>
                            <input 
                                type="number" 
                                value={activeProject.length} 
                                onChange={(e) => handleParamChange('length', e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-lg"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-800/30 rounded-lg p-3 text-sm flex justify-between items-center text-slate-300">
                        <span>Calculated Area:</span>
                        <span className="font-mono text-blue-400 font-semibold">{area} sqm</span>
                    </div>

                    <div className="w-full h-px bg-slate-800"></div>
                    
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-emerald-400 flex justify-between">
                                <span>Price per Roll</span>
                                <span>(฿/ม้วน)</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 font-medium h-full">฿</span>
                                <input 
                                    type="number" 
                                    value={activeProject.priceRoll} 
                                    onChange={(e) => handlePriceRollChange(e.target.value)}
                                    className="w-full bg-slate-950 border border-emerald-900/50 rounded-lg pl-8 pr-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-xl"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-center -space-y-2 relative h-4">
                            <div className="absolute w-full h-px border-t border-dashed border-slate-700"></div>
                            <div className="bg-slate-900 px-2 text-slate-600 text-xs z-10 font-mono">⇋</div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-purple-400 flex justify-between">
                                <span>Price per Sqm</span>
                                <span>(฿/ตร.ม.)</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 font-medium h-full">฿</span>
                                <input 
                                    type="number" 
                                    value={activeProject.priceSqm} 
                                    onChange={(e) => handlePriceSqmChange(e.target.value)}
                                    className="w-full bg-slate-950 border border-purple-900/50 rounded-lg pl-8 pr-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold text-xl"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Custom footer line for invoice look on export */}
                    <div className="pt-4 mt-6 flex justify-between items-center text-xs text-slate-500 opacity-60">
                        <span>{activeProject.name} · {new Date().toLocaleDateString('th-TH')}</span>
                        <span>@vudovn/ag-kit</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons (Not in export) */}
            <div className="w-full max-w-md mt-6">
                <button 
                onClick={exportImage}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-xl font-medium transition-colors cursor-pointer shadow-lg shadow-blue-900/20"
                >
                    <Download className="w-5 h-5" />
                    <span>Download Report (Image)</span>
                </button>
            </div>
        </div>
      </div>

    </div>
  )
}

export default App
