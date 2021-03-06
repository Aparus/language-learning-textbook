import React, { useEffect, useState } from 'react'
import HomeScreen from './screens/HomeScreen'
import AboutScreen from './screens/AboutScreen'
import ChapterSubchaptersListScreen from './screens/ChapterSubchaptersListScreen'
import ContentTypeRenderer from './screens/ContentTypeRenderer'
import DrawerContent from './Drawer'
import { NavigationContainer } from '@react-navigation/native'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { createStackNavigator } from '@react-navigation/stack'
import content from '../utils/content'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDispatch } from 'react-redux'
import { setTranslation } from '../store/translationActions'
import AppLoading from 'expo-app-loading'

const Drawer = createDrawerNavigator()
const Stack = createStackNavigator()

const info = content.getInfo()
const translations = content.getTranslationLangs() // list of available langs

export default function RootNavigation() {
	const dispatch = useDispatch()
	const [isAsyncDataLoaded, setIsAsyncDataLoaded] = useState(false)
	const chapters = content.getTableOfContent()

	useEffect(() => {
		const getTranslationAsync = async () => {
			let trLang = await AsyncStorage.getItem('trLang')
			if (!trLang && translations.length > 0) {
				trLang = translations?.[0]
			}
			let showTranslation = await AsyncStorage.getItem('showTranslation')
			showTranslation =
				showTranslation === 'true' || showTranslation === null ? true : false
			dispatch(setTranslation({ trLang, showTranslation }))
			setIsAsyncDataLoaded(true)
		}
		getTranslationAsync()
		return () => {}
	}, [])

	return isAsyncDataLoaded ? (
		<NavigationContainer>
			<Drawer.Navigator
				initialRouteName='Home'
				drawerContent={props => (
					<DrawerContent {...props} chapters={chapters} info={info} />
				)}
			>
				<Drawer.Screen
					name='Home'
					component={HomeScreen}
					initialParams={{
						info: info,
						translations: translations
					}}
				/>
				<Drawer.Screen
					name='About'
					component={AboutScreen}
					initialParams={{}}
				/>

				{/* CHAPTERS */}

				{chapters.map(chapter => {
					const { id: chapterId, subchapters, title, type } = chapter
					const name = `chapter-${chapterId}` // chapter-001
					const hasSubchapters = Boolean(subchapters.length)
					let chapterComponent = null

					/*  if chapter has subChapters, we render: 

					<Stack.Navigator>
						<ListOfSubchapters /> aka heading of Chapter
						[ <SubChapter /> ]- ContentTypeRenderer for each SubChapter k
					</Stack.Navigator>

					*/
					if (hasSubchapters) {
						const subchaptersStackNavigator = () => (
							<Stack.Navigator
								key={name}
								initialRouteName='Heading'
								screenOptions={{
									headerShown: false
								}}
							>
								<Stack.Screen
									key={name}
									name='Heading'
									component={ChapterSubchaptersListScreen} // list of subchapters aka heading of chapter
									initialParams={{ chapterId, title, subchapters }}
								/>
								{subchapters.map(subchapter => {
									const { id: subchapterId } = subchapter
									const name = `subchapter-${subchapterId}` // subchapter-002
									return (
										<Stack.Screen
											key={name}
											{...{ name }}
											component={ContentTypeRenderer}
											initialParams={{
												chapterId,
												subchapterId
											}}
										/>
									)
								})}
							</Stack.Navigator>
						)

						chapterComponent = subchaptersStackNavigator
					} else {
						chapterComponent = ContentTypeRenderer
					}

					/* 
					if chapter has not subChapters, 
					then we render ContentTypeRenderer directly to chapter screen
					*/

					return (
						<Drawer.Screen
							key={name}
							name={name}
							component={chapterComponent}
							initialParams={{
								chapterId,
								title,
								type
							}}
						/>
					)
				})}
			</Drawer.Navigator>
		</NavigationContainer>
	) : (
		<AppLoading />
	)
}
