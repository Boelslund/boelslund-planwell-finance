import { useAuth } from '../contexts/AuthContext'
import { Loading } from '../components/common/Loading'

export function Home() {
  const { loading } = useAuth()

  // Redirect authenticated users to dashboard
  if (loading) {
    return <Loading message="Loading your account..." />
  }

  return (
    <div>
      <h1>Welcome to PlanWell Finance!</h1>
      <p>Manage your personal finances with ease.</p>
    </div>
  )
}
