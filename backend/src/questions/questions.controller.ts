import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(@Query('city') city?: string, @Query('search') search?: string) {
    return this.questionsService.findAll(city, search);
  }

  @Get('mine')
  @UseGuards(AuthGuard('jwt'))
  findMine(@Req() req) {
    const userId = req.user.userId || req.user._id;
    return this.questionsService.findByAuthor(userId);
  }

  @Get('liked')
  @UseGuards(AuthGuard('jwt'))
  findLiked(@Req() req) {
    const userId = req.user.userId || req.user._id;
    return this.questionsService.findLikedBy(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt')) 
  create(@Body() createQuestionDto: CreateQuestionDto, @Req() req) {
    // Gestion de l'user ID (Google ou Local)
    const userId = req.user.userId || req.user._id;
    const questionWithAuthor = {
      ...createQuestionDto,
      author: userId, 
    };
    return this.questionsService.create(questionWithAuthor);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId || req.user._id;
    return this.questionsService.remove(id, userId);
  }

  @Patch(':id/vote')
  @UseGuards(AuthGuard('jwt'))
  async vote(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId || req.user._id;
    return this.questionsService.toggleVote(id, userId);
  }
}