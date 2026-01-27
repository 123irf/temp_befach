// Client-side auth utility
export const checkAuth = async () => {
  try {
    const response = await fetch('/api/auth/check', {
      credentials: 'include',
    })
    const data = await response.json()
    return data.authenticated === true
  } catch (error) {
    return false
  }
}

export const logout = async () => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    return true
  } catch (error) {
    console.error('Logout error:', error)
    return false
  }
}

