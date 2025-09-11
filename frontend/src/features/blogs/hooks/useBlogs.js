import { useQuery } from '@tanstack/react-query'
import blogService from '../../../services/blogs'

export const useBlogs = () => {
  return useQuery({
      queryKey: ['blogs'],
      queryFn: blogService.getAll,
    })
}