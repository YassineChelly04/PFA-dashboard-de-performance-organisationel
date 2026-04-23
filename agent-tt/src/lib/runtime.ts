export function isVercelDeployment() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV)
}

export function canUseWorkbookRuntimeFallback() {
  if (process.env.ALLOW_WORKBOOK_RUNTIME === '1') {
    return true
  }

  return !isVercelDeployment()
}
