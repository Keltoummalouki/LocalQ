import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll() {
    return this.questionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

@Post()
  @UseGuards(AuthGuard('jwt')) 
  create(@Body() createQuestionDto: CreateQuestionDto, @Req() req) {
    console.log('User dans la requête :', req.user);

    const questionWithAuthor = {
      ...createQuestionDto,
      author: req.user._id, 
    };
    return this.questionsService.create(questionWithAuthor);
  }
}