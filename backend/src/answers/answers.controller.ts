import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createAnswerDto: CreateAnswerDto, @Req() req) {
    // récupère l'ID via le token
    const userId = req.user.userId || req.user._id;
    return this.answersService.create(createAnswerDto, userId);
  }

  @Get('mine')
  @UseGuards(AuthGuard('jwt'))
  findMine(@Req() req) {
    const userId = req.user.userId || req.user._id;
    return this.answersService.findByAuthor(userId);
  }

  @Get('question/:id')
  findByQuestion(@Param('id') id: string) {
    return this.answersService.findByQuestion(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId || req.user._id;
    return this.answersService.remove(id, userId);
  }

  @Patch(':id/vote')
  @UseGuards(AuthGuard('jwt'))
  async vote(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId || req.user._id;
    return this.answersService.toggleVote(id, userId);
  }
}