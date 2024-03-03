'use client'

import { Chat } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'

import { removeChat, shareChat } from '@/app/actions'

import { SidebarActions } from '@/components/sidebar-actions'
import { SidebarItem } from '@/components/sidebar-item'

export interface Thought {
  content: string
}

export interface Context {
  id: number
  name: string
  ownerId: string
  thoughts: Thought[]
  path: string
}

interface SidebarItemsProps {
  contexts?: Context[]
}

export function SidebarItems({ contexts }: SidebarItemsProps) {
  if (!contexts?.length) return null

  return (
    <AnimatePresence>
      {contexts.map(
        (context, index) =>
          context && (
            <motion.div
              key={context?.id}
              exit={{
                opacity: 0,
                height: 0
              }}
            >
              <SidebarItem index={index} context={context}>
               <></>
              </SidebarItem>
            </motion.div>
          )
      )}
    </AnimatePresence>
  )
}
