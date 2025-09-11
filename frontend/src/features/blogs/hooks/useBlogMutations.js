import { useMutation, useQueryClient } from '@tanstack/react-query'
import blogService from '../../../services/blogs'
import { useNotificationDispatch } from '../../../NotificationContext'

export const useBlogMutations = () => {
  const queryClient = useQueryClient()
  const notificationDispatch = useNotificationDispatch()

  const addBlogMutation = useMutation({
    // TODO: IMPLEMENT OPTIMISTIC CREATION
    mutationFn: blogService.create,
    onSuccess: (returnedBlog) => {
      // 1. Show notification
      notificationDispatch({
        type: 'addNotification',
        payload: {
          message: `A new blog '${returnedBlog.title}' by ${returnedBlog.author} added`,
          type: 'success'
        }
      })
      setTimeout(() => notificationDispatch({ type: 'clear' }), 5000);

      // 2. Rather than invalidating the blog list cache,
      // we optimize performance by manually updating the query state
      // maintained by React query to prevent an extra HTTP get request
      queryClient.setQueryData(['blogs'], (oldBlogs) =>
        oldBlogs ? oldBlogs.concat(returnedBlog) : [returnedBlog])

      // queryClient.invalidateQueries({ queryKey: ['blogs'] })

    },
    onError: (error) => {
      notificationDispatch({
        type: 'addNotification',
        payload: {
          message: 'could not create new blog',
          type: 'error'
        }
      });
      setTimeout(() => notificationDispatch({ type: 'clear' }), 5000);
    }
  })

  const updateBlogMutation = useMutation({
    mutationFn: ({ id, newObject }) => blogService.update(id, newObject),

    // Optimistic updates
    onMutate: async ({ id, newObject }) => {
      // Cancel outgoing refetches (so they don't overwrite optimistic update)
      await queryClient.cancelQueries({ queryKey: ['blogs'] })

      // snapshot the previous value
      const previousBlogs = queryClient.getQueryData(['blogs'])

      // Optimistically update the cache
      queryClient.setQueryData(['blogs'], (old) =>
        old.map((blog) =>
          blog.id !== id ? blog : newObject
        )
      )

      return { previousBlogs }
    },

    // if mutation fails, roll back to snapshot
    onError: (err, variables, context) => {
      queryClient.setQueryData(['blogs'], context.previousBlogs)
    },

    // always refetch after success/error to ensure fresh data
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    }
  })

  const deleteBlogMutation = useMutation({
    // TODO: IMPLEMENT OPTIMISTIC DELETION
    mutationFn: (id) => blogService.remove(id),
    onSuccess:
      () => {
        // 1. Show notification
        notificationDispatch({
          type: 'addNotification',
          payload: {
            message: 'blog deleted',
            type: 'success'
          }
        })
        setTimeout(() => notificationDispatch({ type: 'clear' }), 5000);

        // 2. Invalidate the blog list cache so it refreshes
        queryClient.invalidateQueries({ queryKey: ['blogs'] })
      }
  })
  return { addBlogMutation, updateBlogMutation, deleteBlogMutation }
}