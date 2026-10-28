export function matchesAnswer(value: string, answers: readonly string[]): boolean {
  const normalize = (text: string) => text.trim().toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.,!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const answer = normalize(value)
  return answer.length > 0 && answers.some(expected => normalize(expected) === answer)
}

export function namePractice(value: string) {
  const name = value.trim().replace(/\s+/g, ' ')
  if (!/^[a-z]+(?:[ '-][a-z]+)*$/i.test(name)) return null
  return {
    introduction: `Hi! My name's ${name}.`,
    letters: [...name.toUpperCase()].filter(letter => /[A-Z]/.test(letter)).join(' — ')
  }
}
