import './Loading.css'

interface LoadingProps {
    message?: string
}

export function Loading({ message = 'Loading...' }: LoadingProps) {
    return (
        <div className="loading-container" role="status" aria-live="polite">
            <div className="loading-spinner" aria-hidden="true"></div>
            <p className="loading-message">{message}</p>
        </div>
    )
}
