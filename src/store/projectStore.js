import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

const defaultEmptyProject = {
  id: '',
  name: 'New Tape Project',
  width: 24,
  length: 50,
  priceRoll: 57.00,
  priceSqm: 47.50,
  updatedAt: Date.now()
}

export const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,

      addProject: (name = 'New Tape Project') => {
        const newProject = { 
          ...defaultEmptyProject, 
          id: generateUniqueId(),
          name,
          updatedAt: Date.now()
        }
        set((state) => ({
          projects: [newProject, ...state.projects],
          activeProjectId: newProject.id
        }))
      },

      setActiveProject: (id) => {
        set({ activeProjectId: id })
      },

      updateActiveProject: (data) => {
        set((state) => {
          if (!state.activeProjectId) return state
          
          const newProjects = state.projects.map((p) => {
            if (p.id === state.activeProjectId) {
              return { ...p, ...data, updatedAt: Date.now() }
            }
            return p
          })
          
          return { projects: newProjects }
        })
      },

      deleteProject: (id) => {
        set((state) => {
          const newProjects = state.projects.filter(p => p.id !== id)
          let newActiveId = state.activeProjectId
          
          // If deleted active project, select the next available one
          if (state.activeProjectId === id) {
            newActiveId = newProjects.length > 0 ? newProjects[0].id : null
          }
          
          return {
            projects: newProjects,
            activeProjectId: newActiveId
          }
        })
      },
      
      getActiveProject: () => {
        const state = get()
        if (!state.activeProjectId) return null
        return state.projects.find(p => p.id === state.activeProjectId) || null
      }
    }),
    {
      name: 'tape-calculator-projects', 
    }
  )
)
