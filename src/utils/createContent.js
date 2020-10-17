const fs = require('fs')
const path = require('path')
const { getFilesOfDir } = require('./fsUtils')
const { contentMDtoAssetJS } = require('./contentMDtoAssetJS')


// main content.md and all translations: content.en_US.md,... 
const contentFileNames = getFilesOfDir('./content').filter(elem => elem.includes('content'))

// codes of langs: ['ru', 'en', 'ar_SA']
const translations = contentFileNames.filter(elem => elem !== 'content.md').map(elem => elem.replace(/^content\./, '').replace(/\.md$/, ''))

// console.log('translations', contentFileNames)
const contentFolder = "content"
contentFileNames.forEach(fileName => {
    const mdFileContent = fs.readFileSync(path.join(contentFolder, fileName), "utf-8");
    const infoAndChapters = contentMDtoAssetJS(mdFileContent) // { info, chapters }
    const content = fileName === 'content.md' ? {...infoAndChapters, translations } : infoAndChapters

    const beforeContent = `// autogenerated from /${contentFolder}/${fileName}
// via /src/utils/createContent.js
export default `

    fs.writeFileSync(path.join('./assets', fileName.replace(/\.md$/, '.js')), beforeContent + JSON.stringify(content), 'utf-8')

})



console.log('content updated for ', contentFileNames)
console.log('content updated for ', contentFileNames)