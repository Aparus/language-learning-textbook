import content from '../../../utils/content'
import { fetchYoutubeVideoByUrl, isYoutube } from '../../../utils/utils'

export const getSourceAndExtensionFromPath = async path => {
	// === is file local and we need require,
	// or it is external and we need uri ?
	// for now we check it by .ext - local files don't have it ===
	const extractFileFromPath = async uri => {
		// 1) it is youtube link
		if (isYoutube(uri)) {
			const youtubeResponse = await fetchYoutubeVideoByUrl(uri) // from direct-link.vercel.app
			const { urlVideo: uriDirect, thumbnails = [] } = youtubeResponse || {}
			const uriPoster = thumbnails[thumbnails.length - 1]
			const extension = '.mp4' // just guess for small youtube videos
			return { uri: uriDirect, extension, uriPoster }
		}

		const [extension] = uri.match(new RegExp(/(\.mp3)|(\.mp4)$/)) || []
		// 2) it is external file, direct link, we get it as uri param
		if (extension) {
			return { uri, extension }
		} else {
			// 3) it's local file and we get it from assets
			const { file, extension } = content.getFilesByPathString(uri) || {} // file = require(../content/...)
			return { file, extension }
		}
	}
	const { file, uri, extension, uriPoster } =
		(await extractFileFromPath(path)) || {} // file or uri
	const source = file ? file : { uri }
	return { source, extension, posterSource: { uri: uriPoster } }
}