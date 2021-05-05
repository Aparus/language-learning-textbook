import React, { useRef } from 'react'
import {
	View,
	ScrollView,
	TouchableOpacity,
	useWindowDimensions,
	Platform
} from 'react-native'
import { Text, colors } from 'react-native-elements'
import OneLineOneFile from '../contentTypes/OneLineOneFile'
import RichText from '../contentTypes/RichText'
import Media from '../contentTypes/Media'
import Exercise from '../contentTypes/Exercise'
import NotSet from '../contentTypes/NotSet'
import { useSelector } from 'react-redux'
import content from '../../utils/content'
import ChapterHeader from '../ChapterHeader'
import contentTypeInteractivity from '../../config/contentTypeInteractivity'

/* 
	receives a chapterId/subchapterId, and renders proper content type: Cards, Media or Text 
*/

// interactivity ==> component
const getComponent = (interactivity, props) => {
	switch (interactivity) {
		case 'oneLineOneFile':
			return <OneLineOneFile {...props} />
		case 'richText':
			return <RichText {...props} />
		case 'media':
			return <Media {...props} />
		case 'exercise':
			return <Exercise {...props} />
		default:
			return <NotSet {...props} />
	}
}

const ContentTypeRenderer = props => {
	const {
		route: {
			params: { chapterId, subchapterId }
		},
		navigation
	} = props

	const { height: screenHeight } = useWindowDimensions()

	const { showTranslation } = useSelector(state => state.translation)

	const pageScrollViewRef = useRef()
	const phrasalPlayerBlockYRef = useRef()

	const scrollPageTo = y => {
		phrasalPlayerBlockYRef.current = y
		// pageScrollViewRef.current.scrollTo({ y, animated: true })
		setTimeout(() => {
			handleScrollPhrasalPlayer()
		}, 1)
	}

	const handleScrollPhrasalPlayer = () => {
		const y = phrasalPlayerBlockYRef.current
		pageScrollViewRef.current.scrollTo({ y, animated: true })
	}

	// const { height: screenHeight } = useWindowDimensions()

	const contentTypeDoc = subchapterId
		? content.getSubchapter(chapterId, subchapterId)
		: content.getChapter(chapterId)
	const { title, type: typeRaw } = contentTypeDoc
	const contentType = typeRaw ? typeRaw : title
	// const contentTypeInfo = getContentType(type)
	const interactivity = contentTypeInteractivity?.[contentType]

	// if subchapterId is undefined, we opens contentType from 1st level - chapter
	const contentTypeTrDoc = subchapterId
		? content.getSubchapterTr(chapterId, subchapterId)
		: content.getChapterTr(chapterId)

	const files = content.getFilesByPathArray([
		'content',
		chapterId,
		subchapterId
	])

	const subchapterComponentProps = {
		contentTypeDoc,
		contentTypeTrDoc,
		contentType,
		showTranslation,
		chapterId,
		subchapterId,
		files,
		navigation,
		scrollPageTo
	}

	const containerStyle =
		Platform.OS === 'android' || Platform.OS === 'ios'
			? {}
			: { height: screenHeight }

	// in exercises there is lots of similar screens
	// and headers are annoying, then we set them off
	const hideTitles = interactivity === 'exercise'

	return (
		<View style={containerStyle}>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				ref={pageScrollViewRef}
				nestedScrollEnabled
			>
				<ChapterHeader
					{...{ navigation, chapterId, subchapterId, hideTitles }}
				/>
				{interactivity === 'media' && (
					<TouchableOpacity onPress={handleScrollPhrasalPlayer}>
						<Text
							style={{
								color: colors.primary,
								textAlign: 'right',
								marginRight: 5
							}}
						>
							Show phrasal buttons
						</Text>
					</TouchableOpacity>
				)}
				{getComponent(interactivity, subchapterComponentProps)}
			</ScrollView>
		</View>
	)
}

export default ContentTypeRenderer
