import React, { useState } from 'react';
import {
    Box,
    Card,
    CardBody,
    Text,
    VStack,
    HStack,
    IconButton,
    Badge,
    useColorModeValue,
} from '@chakra-ui/react';
import { FiVolume2, FiBookmark } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const WordCard = ({ word, onSwipe, onBookmark, isBookmarked, showDefinition }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const cardBg = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'white');

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const playPronunciation = () => {
        // Use Web Speech API for pronunciation
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word.word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <MotionCard
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="xl"
            cursor="pointer"
            onClick={handleFlip}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(e, { offset, velocity }) => {
                const swipeThreshold = 100;
                if (offset.x > swipeThreshold) {
                    onSwipe('right'); // Learned
                } else if (offset.x < -swipeThreshold) {
                    onSwipe('left'); // Skip
                }
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            minH="400px"
            w="full"
            maxW="400px"
        >
            <CardBody p={8}>
                <VStack spacing={6} align="stretch" h="full" justify="center">
                    {/* Header with bookmark */}
                    <HStack justify="space-between">
                        <Badge colorScheme="brand" fontSize="sm" px={3} py={1} borderRadius="full">
                            {word.category}
                        </Badge>
                        <IconButton
                            icon={<FiBookmark />}
                            variant={isBookmarked ? 'solid' : 'ghost'}
                            colorScheme="brand"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onBookmark();
                            }}
                            aria-label="Bookmark word"
                        />
                    </HStack>

                    {/* Main content */}
                    <VStack spacing={4} flex="1" justify="center">
                        {!isFlipped || !showDefinition ? (
                            <>
                                {/* Front: Word */}
                                <Text
                                    fontSize="5xl"
                                    fontWeight="bold"
                                    color="brand.500"
                                    textAlign="center"
                                >
                                    {word.word}
                                </Text>
                                {word.pronunciation && (
                                    <Text fontSize="xl" color="gray.500" fontStyle="italic">
                                        /{word.pronunciation}/
                                    </Text>
                                )}
                                <HStack>
                                    <IconButton
                                        icon={<FiVolume2 />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playPronunciation();
                                        }}
                                        colorScheme="brand"
                                        variant="ghost"
                                        size="lg"
                                        aria-label="Play pronunciation"
                                    />
                                </HStack>
                            </>
                        ) : (
                            <>
                                {/* Back: Definition */}
                                <Text fontSize="2xl" fontWeight="semibold" color={textColor} textAlign="center">
                                    {word.definition}
                                </Text>
                                {word.example_sentence && (
                                    <Box
                                        bg="brand.50"
                                        p={4}
                                        borderRadius="lg"
                                        borderLeft="4px solid"
                                        borderColor="brand.500"
                                    >
                                        <Text fontSize="md" color="gray.600" fontStyle="italic">
                                            "{word.example_sentence}"
                                        </Text>
                                    </Box>
                                )}
                            </>
                        )}
                    </VStack>

                    {/* Instructions */}
                    <VStack spacing={2}>
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                            Tap to flip • Swipe right to learn • Swipe left to skip
                        </Text>
                    </VStack>
                </VStack>
            </CardBody>
        </MotionCard>
    );
};

export default WordCard;
