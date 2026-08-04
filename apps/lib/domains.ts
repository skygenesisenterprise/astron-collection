export type Environment = 'production' | 'localhost'

export interface DomainConfig {
  main: string
  manager: string
  sso: string
  protocol: string
}

const DOMAINS: Record<Environment, DomainConfig> = {
  production: {
    main: 'astron-collection.com',
    manager: 'manager.astron-collection.com',
    sso: 'sso.astron-collection.com',
    protocol: 'https',
  },
  localhost: {
    main: 'astron-collection.localhost',
    manager: 'manager.astron-collection.localhost',
    sso: 'sso.astron-collection.localhost',
    protocol: 'http',
  },
}

export function detectEnvironment(): Environment {
  if (typeof window === 'undefined') return 'production'
  return window.location.hostname.includes('localhost') ? 'localhost' : 'production'
}

export function getDomainConfig(): DomainConfig {
  return DOMAINS[detectEnvironment()]
}

export function getDomainUrl(service: 'main' | 'manager' | 'sso', path: string = ''): string {
  const config = getDomainConfig()
  return `${config.protocol}://${config[service]}${path}`
}

export function switchDomain(target: 'main' | 'manager' | 'sso', path: string): string {
  return getDomainUrl(target, path)
}
