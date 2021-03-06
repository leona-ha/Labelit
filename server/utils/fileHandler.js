const fs = require('fs').promises
const path = require('path')
const { encrypt, decrypt } = require('./crypter')

const read = async (folderPath, projectId, password) => {
  let stat
  let textCount = 0
  const texts = []

  // Check if path is valid
  try {
    stat = await fs.lstat(folderPath)
  } catch (error) {
    throw new Error('Path does not exist')
  }

  try {
    // Check if directory or file
    if (stat.isFile()) {
      const content = await fs.readFile(folderPath)
      texts[0] = { name: stat.name, content, project: projectId }
    } else {
      const files = await fs.readdir(folderPath, { withFileTypes: true })
      for (const file of files) {
        if (file.isDirectory()) return
        textCount++
        const content = await fs.readFile(
          path.join(folderPath, file.name),
          'utf8'
        )
        const contentEnc = encrypt(content, password)
        texts.push({
          name: file.name,
          contentEncOrg: contentEnc,
          contentEncSaved: contentEnc,
          contentEncHtml: contentEnc,
          project: projectId,
        })
      }
    }
  } catch (error) {
    throw new Error('Error reading files')
  }

  return { textCount, texts }
}

const write = async (
  folderPath,
  projectName,
  texts,
  password,
  classActive,
  projectClassifications
) => {
  try {
    stat = await fs.lstat(folderPath)
  } catch (error) {
    throw new Error('Path does not exist')
  }
  const totalPath = path.join(folderPath, `Labelit - ${projectName}`)
  await fs.mkdir(totalPath, { recursive: true })
  const classContent = {}

  for (const text of texts) {
    if (text.status !== 'confirmed') continue
    if (classActive)
      classContent[text.name] = text.classifications.map(
        (classification) =>
          projectClassifications.find(
            (pClassification) =>
              pClassification._id.toString() == classification.toString()
          ).name
      )
    fs.writeFile(
      path.join(totalPath, text.name),
      decrypt(text.contentEncSaved, password)
    )
  }

  if (classActive)
    fs.writeFile(
      path.join(totalPath, 'classifications.json'),
      JSON.stringify(classContent, null, 4)
    )
}

module.exports = { read, write }
