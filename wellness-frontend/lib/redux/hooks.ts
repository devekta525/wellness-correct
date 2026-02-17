import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Add memoized selector hook for better performance
export const useMemoizedSelector = <T extends (state: RootState) => unknown>(
  selector: T,
  equalityFn?: (left: ReturnType<T>, right: ReturnType<T>) => boolean
) => {
  return useAppSelector(selector, {
    equalityFn: equalityFn as (a: unknown, b: unknown) => boolean
  })
} 