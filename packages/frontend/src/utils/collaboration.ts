import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { ref, onBeforeUnmount } from 'vue'

export function useCollaboration(roomId: string, userId: string, userName: string, isTrainer: boolean = false) {
  const ydoc = new Y.Doc()
  
  const provider = new HocuspocusProvider({
    url: `ws://${window.location.hostname}:1234`,
    name: roomId,
    document: ydoc,
    onAuthenticationFailed: () => console.error('Authentication failed'),
    onStatus: ({ status }) => console.log(`Collaboration status: ${status}`)
  })

  // Le reste reste identique (YJS est standard entre WebRTC et Hocuspocus)
  const sharedState = ydoc.getMap('state')
  const awareness = provider.awareness

  const activeChapterId = ref<string | null>(sharedState.get('activeChapterId') as string || null)
  const users = ref<any[]>([])
  const trainerMouse = ref({ x: 0, y: 0 })

  // Initialiser l'awareness (présence)
  awareness.setLocalStateField('user', {
    name: userName,
    color: isTrainer ? '#ff0000' : '#00ff00',
    isTrainer
  })

  // Écouter les changements d'état partagé
  sharedState.observe(() => {
    activeChapterId.value = sharedState.get('activeChapterId') as string || null
  })

  // Écouter l'awareness pour les souris et les utilisateurs connectés
  awareness.on('change', () => {
    const states = awareness.getStates()
    const newUsers: any[] = []
    
    states.forEach((state: any, clientID) => {
      if (state.user) {
        newUsers.push({ clientID, ...state.user })
        if (state.user.isTrainer && state.mouse) {
          trainerMouse.value = state.mouse
        }
      }
    })
    users.value = newUsers
  })

  // Si c'est le formateur, il peut mettre à jour l'état
  const updateActiveChapter = (chapterId: string) => {
    if (isTrainer) {
      sharedState.set('activeChapterId', chapterId)
    }
  }

  // Mettre à jour la position de la souris si formateur
  const updateMousePosition = (x: number, y: number) => {
    if (isTrainer) {
      awareness.setLocalStateField('mouse', { x, y })
    }
  }

  onBeforeUnmount(() => {
    provider.disconnect()
    ydoc.destroy()
  })

  return {
    activeChapterId,
    users,
    trainerMouse,
    updateActiveChapter,
    updateMousePosition
  }
}
