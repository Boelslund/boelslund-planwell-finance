import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import './Layout.css'

interface LayoutProps {
    children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="layout-container">
            <Header />
            <main className="layout-main">
                {children}
            </main>
            <Footer />
        </div>
    )
}
