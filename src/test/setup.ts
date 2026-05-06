import '@testing-library/jest-dom'

// scrollIntoView não existe no jsdom
window.HTMLElement.prototype.scrollIntoView = () => {}
