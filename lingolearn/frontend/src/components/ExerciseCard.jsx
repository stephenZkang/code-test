import React from 'react';
import {
    Box,
    Card,
    CardBody,
    Text,
    VStack,
    Radio,
    RadioGroup,
    Input,
    Button,
    Badge,
    useColorModeValue,
} from '@chakra-ui/react';

const ExerciseCard = ({ exercise, onAnswer, selectedAnswer, onAnswerChange, showFeedback, isCorrect }) => {
    const cardBg = useColorModeValue('white', 'gray.700');
    const correctBg = useColorModeValue('green.50', 'green.900');
    const incorrectBg = useColorModeValue('red.50', 'red.900');

    const renderQuestionContent = () => {
        switch (exercise.type) {
            case 'multiple_choice':
                return (
                    <RadioGroup value={selectedAnswer} onChange={onAnswerChange}>
                        <VStack align="stretch" spacing={3}>
                            {exercise.options.map((option, index) => (
                                <Box
                                    key={index}
                                    p={4}
                                    borderWidth="2px"
                                    borderColor={
                                        showFeedback && option === exercise.correctAnswer
                                            ? 'green.500'
                                            : showFeedback && option === selectedAnswer
                                                ? 'red.500'
                                                : selectedAnswer === option
                                                    ? 'brand.500'
                                                    : 'gray.200'
                                    }
                                    borderRadius="lg"
                                    cursor="pointer"
                                    transition="all 0.2s"
                                    bg={
                                        showFeedback && option === exercise.correctAnswer
                                            ? correctBg
                                            : showFeedback && option === selectedAnswer
                                                ? incorrectBg
                                                : 'transparent'
                                    }
                                    _hover={{
                                        borderColor: !showFeedback ? 'brand.400' : undefined,
                                        transform: !showFeedback ? 'translateX(4px)' : undefined,
                                    }}
                                    onClick={() => !showFeedback && onAnswerChange(option)}
                                >
                                    <Radio value={option} isDisabled={showFeedback}>
                                        <Text fontSize="md">{option}</Text>
                                    </Radio>
                                </Box>
                            ))}
                        </VStack>
                    </RadioGroup>
                );

            case 'fill_blank':
                return (
                    <VStack spacing={4} align="stretch">
                        <Box
                            p={4}
                            bg="gray.50"
                            borderRadius="lg"
                            borderLeft="4px solid"
                            borderColor="brand.500"
                        >
                            <Text fontSize="lg">{exercise.sentence}</Text>
                        </Box>
                        <Input
                            placeholder="Type your answer..."
                            size="lg"
                            value={selectedAnswer}
                            onChange={(e) => onAnswerChange(e.target.value)}
                            isDisabled={showFeedback}
                            borderColor={
                                showFeedback
                                    ? isCorrect
                                        ? 'green.500'
                                        : 'red.500'
                                    : 'gray.300'
                            }
                            borderWidth="2px"
                            _focus={{
                                borderColor: 'brand.500',
                                boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                            }}
                        />
                        {exercise.hint && (
                            <Text fontSize="sm" color="gray.500">
                                Hint: {exercise.hint}
                            </Text>
                        )}
                        {showFeedback && !isCorrect && (
                            <Text fontSize="sm" color="green.600" fontWeight="semibold">
                                Correct answer: {exercise.correctAnswer}
                            </Text>
                        )}
                    </VStack>
                );

            case 'listening':
                return (
                    <VStack spacing={4} align="stretch">
                        {exercise.audioUrl ? (
                            <audio controls style={{ width: '100%' }}>
                                <source src={exercise.audioUrl} type="audio/mpeg" />
                                Your browser does not support audio playback.
                            </audio>
                        ) : (
                            <Box
                                p={4}
                                bg="brand.50"
                                borderRadius="lg"
                                textAlign="center"
                            >
                                <Text fontSize="2xl" fontStyle="italic" color="brand.700">
                                    /{exercise.pronunciation}/
                                </Text>
                                <Text fontSize="sm" color="gray.600" mt={2}>
                                    (Audio pronunciation would play here)
                                </Text>
                            </Box>
                        )}
                        <RadioGroup value={selectedAnswer} onChange={onAnswerChange}>
                            <VStack align="stretch" spacing={3}>
                                {exercise.options.map((option, index) => (
                                    <Box
                                        key={index}
                                        p={4}
                                        borderWidth="2px"
                                        borderColor={
                                            showFeedback && option === exercise.correctAnswer
                                                ? 'green.500'
                                                : showFeedback && option === selectedAnswer
                                                    ? 'red.500'
                                                    : selectedAnswer === option
                                                        ? 'brand.500'
                                                        : 'gray.200'
                                        }
                                        borderRadius="lg"
                                        cursor="pointer"
                                        transition="all 0.2s"
                                        bg={
                                            showFeedback && option === exercise.correctAnswer
                                                ? correctBg
                                                : showFeedback && option === selectedAnswer
                                                    ? incorrectBg
                                                    : 'transparent'
                                        }
                                        _hover={{
                                            borderColor: !showFeedback ? 'brand.400' : undefined,
                                            transform: !showFeedback ? 'translateX(4px)' : undefined,
                                        }}
                                        onClick={() => !showFeedback && onAnswerChange(option)}
                                    >
                                        <Radio value={option} isDisabled={showFeedback}>
                                            <Text fontSize="md">{option}</Text>
                                        </Radio>
                                    </Box>
                                ))}
                            </VStack>
                        </RadioGroup>
                        {showFeedback && (
                            <Box p={3} bg="gray.50" borderRadius="md">
                                <Text fontSize="sm" color="gray.700">
                                    <strong>Definition:</strong> {exercise.definition}
                                </Text>
                            </Box>
                        )}
                    </VStack>
                );

            default:
                return null;
        }
    };

    return (
        <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
            <CardBody p={6}>
                <VStack spacing={6} align="stretch">
                    {/* Header */}
                    <VStack align="stretch" spacing={2}>
                        <Badge
                            colorScheme="brand"
                            alignSelf="flex-start"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                        >
                            {exercise.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Text fontSize="xl" fontWeight="bold" color="brand.600">
                            {exercise.question}
                        </Text>
                        {exercise.type !== 'fill_blank' && exercise.word && (
                            <Text fontSize="3xl" fontWeight="bold" textAlign="center" color="brand.500">
                                {exercise.word}
                            </Text>
                        )}
                    </VStack>

                    {/* Question content */}
                    {renderQuestionContent()}

                    {/* Submit button */}
                    {!showFeedback && (
                        <Button
                            colorScheme="brand"
                            size="lg"
                            onClick={onAnswer}
                            isDisabled={!selectedAnswer}
                            w="full"
                        >
                            Check Answer
                        </Button>
                    )}

                    {/* Feedback */}
                    {showFeedback && (
                        <Box
                            p={4}
                            borderRadius="lg"
                            bg={isCorrect ? correctBg : incorrectBg}
                            borderWidth="2px"
                            borderColor={isCorrect ? 'green.500' : 'red.500'}
                        >
                            <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color={isCorrect ? 'green.700' : 'red.700'}
                                textAlign="center"
                            >
                                {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                            </Text>
                        </Box>
                    )}
                </VStack>
            </CardBody>
        </Card>
    );
};

export default ExerciseCard;
