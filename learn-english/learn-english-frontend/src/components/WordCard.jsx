import { useState } from 'react';
import {
    Box,
    Card,
    CardBody,
    Text,
    VStack,
    HStack,
    Icon,
    IconButton,
    useColorModeValue,
    Heading,
} from '@chakra-ui/react';
import { FiVolume2, FiBookmark } from 'react-icons/fi';
import { useSwipe } from '../hooks/useSwipe';

const WordCard = ({ word, onSwipeLeft, onSwipeRight, onBookmark }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const cardBg = useColorModeValue('white', 'gray.700');
    const swipeHandlers = useSwipe(onSwipeLeft, onSwipeRight);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleBookmark = (e) => {
        e.stopPropagation();
        setIsBookmarked(!isBookmarked);
        if (onBookmark) {
            onBookmark(word.id, !isBookmarked);
        }
    };

    const playPronunciation = (e) => {
        e.stopPropagation();
        // Use Web Speech API
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word.english);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <Box
            {...swipeHandlers}
            position="relative"
            w="full"
            maxW="400px"
            mx="auto"
        >
            <Card
                bg={cardBg}
                boxShadow="2xl"
                borderRadius="2xl"
                overflow="hidden"
                cursor="pointer"
                onClick={handleFlip}
                transition="transform 0.6s"
                transform={isFlipped ? 'rotateY(180deg)' : 'none'}
                style={{ transformStyle: 'preserve-3d' }}
                minH="400px"
            >
                <CardBody
                    p="8"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                >
                    {!isFlipped ? (
                        // Front side
                        <VStack spacing="6" w="full" transform="rotateY(0)">
                            <IconButton
                                icon={<FiBookmark />}
                                position="absolute"
                                top="4"
                                right="4"
                                colorScheme={isBookmarked ? 'yellow' : 'gray'}
                                variant={isBookmarked ? 'solid' : 'ghost'}
                                onClick={handleBookmark}
                                aria-label="Bookmark"
                            />

                            <Heading size="2xl" color="brand.500" textAlign="center">
                                {word.english}
                            </Heading>

                            {word.pronunciation && (
                                <HStack spacing="2">
                                    <Text fontSize="lg" color="gray.500">
                                        {word.pronunciation}
                                    </Text>
                                    <IconButton
                                        icon={<FiVolume2 />}
                                        size="sm"
                                        colorScheme="brand"
                                        variant="ghost"
                                        onClick={playPronunciation}
                                        aria-label="Play pronunciation"
                                    />
                                </HStack>
                            )}

                            <Box
                                mt="4"
                                p="3"
                                bg="brand.50"
                                borderRadius="lg"
                                w="full"
                                textAlign="center"
                            >
                                <Text fontSize="sm" color="brand.700">
                                    点击翻转查看中文
                                </Text>
                            </Box>
                        </VStack>
                    ) : (
                        // Back side
                        <VStack
                            spacing="6"
                            w="full"
                            transform="rotateY(180deg)"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <Heading size="xl" color="brand.600" textAlign="center">
                                {word.chinese}
                            </Heading>

                            {word.exampleSentence && (
                                <Box
                                    p="4"
                                    bg="gray.50"
                                    borderLeft="4px"
                                    borderColor="brand.400"
                                    borderRadius="md"
                                    w="full"
                                >
                                    <Text fontSize="md" color="gray.700" fontStyle="italic">
                                        {word.exampleSentence}
                                    </Text>
                                </Box>
                            )}

                            {word.category && (
                                <Box
                                    px="3"
                                    py="1"
                                    bg="accent.100"
                                    borderRadius="full"
                                >
                                    <Text fontSize="sm" color="accent.700" fontWeight="medium">
                                        {word.category}
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    )}
                </CardBody>
            </Card>

            {/* Swipe hints */}
            <HStack
                position="absolute"
                bottom="-50px"
                left="0"
                right="0"
                justify="space-between"
                px="4"
            >
                <Text fontSize="sm" color="gray.500">
                    ← 跳过
                </Text>
                <Text fontSize="sm" color="gray.500">
                    已学习 →
                </Text>
            </HStack>
        </Box>
    );
};

export default WordCard;
