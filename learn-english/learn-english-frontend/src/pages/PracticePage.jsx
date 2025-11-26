import { useState, useEffect } from 'react';
import {
    Container,
    VStack,
    Heading,
    Text,
    Button,
    Radio,
    RadioGroup,
    Stack,
    Input,
    Box,
    Progress,
    Icon,
    HStack,
    Badge,
    useToast,
    Card,
    CardBody,
} from '@chakra-ui/react';
import { FiCheck, FiX, FiPlay } from 'react-icons/fi';
import { exerciseAPI } from '../services/api';

const PracticePage = () => {
    const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [startTime, setStartTime] = useState(null);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const startPractice = async () => {
        try {
            setLoading(true);
            const response = await exerciseAPI.generate(questionType, 10);
            setQuestions(response.data || []);
            setCurrentIndex(0);
            setScore({ correct: 0, total: 0 });
            setStartTime(Date.now());
        } catch (error) {
            toast({
                title: '加载失败',
                description: '无法生成练习题',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!userAnswer) {
            toast({
                title: '请选择答案',
                status: 'warning',
                duration: 2000,
            });
            return;
        }

        const question = questions[currentIndex];
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        try {
            const response = await exerciseAPI.submit({
                wordId: question.word.id,
                questionType: questionType,
                userAnswer: userAnswer,
                timeSpent: timeSpent,
            });

            setResult(response.data);
            setShowResult(true);

            if (response.data.isCorrect) {
                setScore({ ...score, correct: score.correct + 1, total: score.total + 1 });
            } else {
                setScore({ ...score, total: score.total + 1 });
            }
        } catch (error) {
            toast({
                title: '提交失败',
                description: '无法提交答案',
                status: 'error',
                duration: 3000,
            });
        }
    };

    const handleNext = () => {
        setShowResult(false);
        setResult(null);
        setUserAnswer('');
        setStartTime(Date.now());

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            showFinalScore();
        }
    };

    const showFinalScore = () => {
        const accuracy = score.total > 0 ? (score.correct / score.total * 100).toFixed(1) : 0;
        toast({
            title: '🎉 练习完成!',
            description: `正确率: ${accuracy}% (${score.correct}/${score.total})`,
            status: 'success',
            duration: 5000,
            isClosable: true,
        });
        setQuestions([]);
    };

    if (questions.length === 0) {
        return (
            <Container maxW="container.md" py="8">
                <VStack spacing="8" align="stretch">
                    <Heading size="lg" color="brand.600" textAlign="center">
                        选择练习类型
                    </Heading>

                    <RadioGroup value={questionType} onChange={setQuestionType}>
                        <Stack spacing="4">
                            <Box
                                p="4"
                                borderWidth="2px"
                                borderRadius="lg"
                                borderColor={questionType === 'MULTIPLE_CHOICE' ? 'brand.500' : 'gray.200'}
                                cursor="pointer"
                                onClick={() => setQuestionType('MULTIPLE_CHOICE')}
                            >
                                <Radio value="MULTIPLE_CHOICE" colorScheme="brand" size="lg">
                                    <VStack align="start" spacing="1" ml="2">
                                        <Text fontWeight="bold">选择题</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            根据英文选择正确的中文释义
                                        </Text>
                                    </VStack>
                                </Radio>
                            </Box>

                            <Box
                                p="4"
                                borderWidth="2px"
                                borderRadius="lg"
                                borderColor={questionType === 'FILL_BLANK' ? 'brand.500' : 'gray.200'}
                                cursor="pointer"
                                onClick={() => setQuestionType('FILL_BLANK')}
                            >
                                <Radio value="FILL_BLANK" colorScheme="brand" size="lg">
                                    <VStack align="start" spacing="1" ml="2">
                                        <Text fontWeight="bold">填空题</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            根据中文输入正确的英文单词
                                        </Text>
                                    </VStack>
                                </Radio>
                            </Box>

                            <Box
                                p="4"
                                borderWidth="2px"
                                borderRadius="lg"
                                borderColor={questionType === 'LISTENING' ? 'brand.500' : 'gray.200'}
                                cursor="pointer"
                                onClick={() => setQuestionType('LISTENING')}
                            >
                                <Radio value="LISTENING" colorScheme="brand" size="lg">
                                    <VStack align="start" spacing="1" ml="2">
                                        <Text fontWeight="bold">听力题</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            听发音选择正确的英文单词
                                        </Text>
                                    </VStack>
                                </Radio>
                            </Box>
                        </Stack>
                    </RadioGroup>

                    <Button
                        colorScheme="brand"
                        size="lg"
                        onClick={startPractice}
                        isLoading={loading}
                    >
                        开始练习
                    </Button>
                </VStack>
            </Container>
        );
    }

    const question = questions[currentIndex];
    const progressValue = ((currentIndex + 1) / questions.length) * 100;

    return (
        <Container maxW="container.md" py="8">
            <VStack spacing="6" align="stretch">
                {/* Header */}
                <HStack justify="space-between">
                    <Heading size="md" color="brand.600">
                        题目 {currentIndex + 1}/{questions.length}
                    </Heading>
                    <Badge colorScheme="green" fontSize="md" px="3" py="1">
                        {score.correct}/{score.total}
                    </Badge>
                </HStack>

                <Progress value={progressValue} colorScheme="brand" borderRadius="full" />

                {/* Question */}
                <Card boxShadow="lg">
                    <CardBody>
                        <VStack spacing="6" align="stretch">
                            {questionType === 'MULTIPLE_CHOICE' && (
                                <>
                                    <Box textAlign="center" p="6" bg="brand.50" borderRadius="lg">
                                        <Text fontSize="3xl" fontWeight="bold" color="brand.600">
                                            {question.word.english}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600" mt="2">
                                            {question.word.pronunciation}
                                        </Text>
                                    </Box>

                                    <RadioGroup value={userAnswer} onChange={setUserAnswer}>
                                        <Stack spacing="3">
                                            {question.options?.map((option, index) => (
                                                <Box
                                                    key={index}
                                                    p="4"
                                                    borderWidth="2px"
                                                    borderRadius="lg"
                                                    borderColor={userAnswer === option ? 'brand.500' : 'gray.200'}
                                                    cursor="pointer"
                                                    onClick={() => !showResult && setUserAnswer(option)}
                                                    bg={
                                                        showResult
                                                            ? option === result?.correctAnswer
                                                                ? 'green.50'
                                                                : option === userAnswer
                                                                    ? 'red.50'
                                                                    : 'white'
                                                            : 'white'
                                                    }
                                                >
                                                    <Radio value={option} isDisabled={showResult}>
                                                        {option}
                                                    </Radio>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </RadioGroup>
                                </>
                            )}

                            {questionType === 'FILL_BLANK' && (
                                <>
                                    <Box textAlign="center" p="6" bg="brand.50" borderRadius="lg">
                                        <Text fontSize="2xl" fontWeight="bold" color="brand.600">
                                            {question.hint}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600" mt="2">
                                            请输入对应的英文单词
                                        </Text>
                                    </Box>

                                    <Input
                                        size="lg"
                                        placeholder="输入英文单词"
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        isDisabled={showResult}
                                        textAlign="center"
                                        fontSize="xl"
                                    />
                                </>
                            )}

                            {questionType === 'LISTENING' && (
                                <>
                                    <Box textAlign="center" p="6" bg="brand.50" borderRadius="lg">
                                        <Button
                                            leftIcon={<Icon as={FiPlay} />}
                                            colorScheme="brand"
                                            size="lg"
                                            onClick={() => {
                                                const utterance = new SpeechSynthesisUtterance(question.word.english);
                                                utterance.lang = 'en-US';
                                                window.speechSynthesis.speak(utterance);
                                            }}
                                        >
                                            播放发音
                                        </Button>
                                        <Text fontSize="sm" color="gray.600" mt="4">
                                            听发音，选择正确的单词
                                        </Text>
                                    </Box>

                                    <RadioGroup value={userAnswer} onChange={setUserAnswer}>
                                        <Stack spacing="3">
                                            {question.options?.map((option, index) => (
                                                <Box
                                                    key={index}
                                                    p="4"
                                                    borderWidth="2px"
                                                    borderRadius="lg"
                                                    borderColor={userAnswer === option ? 'brand.500' : 'gray.200'}
                                                    cursor="pointer"
                                                    onClick={() => !showResult && setUserAnswer(option)}
                                                >
                                                    <Radio value={option} isDisabled={showResult}>
                                                        {option}
                                                    </Radio>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </RadioGroup>
                                </>
                            )}

                            {/* Result Display */}
                            {showResult && (
                                <Box
                                    p="4"
                                    bg={result?.isCorrect ? 'green.50' : 'red.50'}
                                    borderRadius="lg"
                                    borderWidth="2px"
                                    borderColor={result?.isCorrect ? 'green.400' : 'red.400'}
                                >
                                    <HStack spacing="3">
                                        <Icon
                                            as={result?.isCorrect ? FiCheck : FiX}
                                            boxSize="6"
                                            color={result?.isCorrect ? 'green.600' : 'red.600'}
                                        />
                                        <VStack align="start" spacing="1">
                                            <Text fontWeight="bold" color={result?.isCorrect ? 'green.800' : 'red.800'}>
                                                {result?.isCorrect ? '✅ 回答正确!' : '❌ 回答错误'}
                                            </Text>
                                            {!result?.isCorrect && (
                                                <Text fontSize="sm">
                                                    正确答案: {result?.correctAnswer}
                                                </Text>
                                            )}
                                            {result?.explanation && (
                                                <Text fontSize="sm" color="gray.700" fontStyle="italic">
                                                    {result.explanation}
                                                </Text>
                                            )}
                                        </VStack>
                                    </HStack>
                                </Box>
                            )}

                            {/* Action Buttons */}
                            {!showResult ? (
                                <Button colorScheme="brand" size="lg" onClick={handleSubmit}>
                                    提交答案
                                </Button>
                            ) : (
                                <Button colorScheme="brand" size="lg" onClick={handleNext}>
                                    {currentIndex < questions.length - 1 ? '下一题' : '完成'}
                                </Button>
                            )}
                        </VStack>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
};

export default PracticePage;
