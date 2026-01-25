export const getDocsUrl = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:5174'
  }
  return 'https://docs.litui.dev'
}
