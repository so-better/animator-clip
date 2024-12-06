import { data as DapData } from 'dap-util'
/**
 * 用于Clip生成唯一的key
 */
export const createUniqueKey = (): number => {
  let key = DapData.get<number>(window, 'animator-clip-key') || 0
  key++
  DapData.set(window, 'animator-clip-key', key)
  return key
}
