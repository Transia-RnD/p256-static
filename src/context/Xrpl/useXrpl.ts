import { useContext } from 'react'
import XrplContext from './XrplContext'

export default function useXrpl() {
  const context = useContext(XrplContext)
  return context
}
