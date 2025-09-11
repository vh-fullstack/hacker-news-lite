import { lazy } from 'react'

export const HomePage = lazy(() => import('./HomePage'));
export const UsersPage = lazy(() => import('./UsersPage'));
export const UserDetailPage = lazy(() => import('./UserDetailPage'));
export const BlogDetailPage = lazy(() => import('./BlogDetailPage'));