import fs from 'fs'
import path from 'path'
import { getFilesOfDir, writeFileSyncRecursive } from './fsUtils.js'
import { contentMDtoAssetJS } from './contentMDtoAssetJS.js'

// main content.md and all translations: content.en_US.md,...
const contentFileNames = getFilesOfDir('./content').filter(elem =>
	elem.includes('content')
)

const contentFolder = 'content'

const generateContentAssets = () => {
	contentFileNames.forEach(fileName => {
		const mdFileContent = fs
			.readFileSync(path.join(contentFolder, fileName), 'utf-8')
			.replace(/\r/g, '') // in windows somehow appears this symbols
		const content = contentMDtoAssetJS(mdFileContent) // { info, chapters }

		const beforeContent = `// autogenerated from /${contentFolder}/${fileName}
    // via /src/utils/createContent.js
    export default `
		const filePath = path.join('./assets', fileName.replace(/\.md$/, '.js'))
		writeFileSyncRecursive(
			filePath,
			beforeContent + JSON.stringify(content),
			'utf-8'
		)
	})
}

const generateTextContentMap = () => {
	const requireLines = contentFileNames.map(elem => {
		// codes of langs: ['ru', 'en', 'ar_SA'], 'oo' for original
		const [, fileName, langCode = 'oo'] = elem.match(/^(content\.?(.+?)?)\.md$/)
		return `\t'${langCode}': require('./${fileName}.js')` // "ru": require('./content.ru.js'),
	})

	const fileContent = `//autogenerated from files: /${contentFolder}/content.LANG_CODE.md
// via /src/utils/createContent.js
export default {
${requireLines.join(',\n')}
}`
	writeFileSyncRecursive(
		path.join('./assets', 'textContentMap.js'),
		fileContent,
		'utf-8'
	)
}

generateContentAssets()
generateTextContentMap()

console.log('content updated for ', contentFileNames)
