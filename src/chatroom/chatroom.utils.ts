import { Readable } from 'stream';
import * as readline from 'readline';
import { ChatCreationDTO } from './dto/chat-creation.dto';
import { Types } from 'mongoose';
import { ChatReplyDTO } from './dto/chat-reply.dto';

export class ChatRoomUtils {
  setTimetoSend(timeToSend: Date, hour: string, minute: string) {
    timeToSend.setUTCHours(Number(hour));
    timeToSend.setUTCMinutes(Number(minute));
    timeToSend.setUTCHours(timeToSend.getUTCHours() - 9);
  }

  parseTextToChatCreationDTO(
    characterId: string,
    lines: string[],
  ): { chatCreationDTOs: ChatCreationDTO[]; errorLines: string[] } {
    let date = null as Date;
    const chatCreationDTOs = [];
    const errorLines = [];

    lines.forEach((line) => {
      if (line.match(/^\d+월 \d+일/)) {
        //get month and date from the line ex 4월 1일
        date = this.getMonthAndDay(line);
        console.log('\nparsing for date', date);
      } else if (date && line.includes(':')) {
        //get the hour, minute + chat from the line
        const { timeToSend, chats } = this.getTimeAndChat(line, date);

        console.log('time to send: ', timeToSend, '\nchats: ', chats);

        const newChatDTO = new ChatCreationDTO(
          new Types.ObjectId(characterId),
          chats,
          timeToSend,
        );
        chatCreationDTOs.push(newChatDTO);
      } else if (line.trim() !== '') {
        //there was some string but couldn't parse it.
        console.error(`Unable to parse line: ${line}`);
        errorLines.push(line);
      }
    });

    return { chatCreationDTOs, errorLines };
  }

  parseTextToChatReplyDTO(
    characterId: string,
    lines: string[],
  ): { chatReplyDTOs: ChatReplyDTO[]; errorLines: string[] } {
    let date = null as Date;
    let timeToSend = null as Date;
    const chatReplyDTOs = [];
    const errorLines = [];

    lines.forEach((line) => {
      if (line.match(/^\d+월 \d+일/)) {
        //get month and date from the line ex 4월 1일
        date = this.getMonthAndDay(line);

        console.log('\nparsing for date', date);
      } else if (date && line.match(/\d+:\d+/)) {
        //get the hour, minute + chat from the line(we don't need the chat only time)
        const TimeAndChat = this.getTimeAndChat(line, date);
        timeToSend = TimeAndChat.timeToSend;
        console.log('timeToSend set: ', timeToSend);
      } else if (date && line.includes('Reply')) {
        //get the reply content
        const content = line.split(':')[1].trim();
        const chats = [] as string[];
        this.parseContentTOChat(chats, content);

        console.log('time to send: ', timeToSend, '\nchats: ', chats);

        const newChatDTO = new ChatReplyDTO(
          new Types.ObjectId(characterId),
          chats,
          timeToSend,
        );
        chatReplyDTOs.push(newChatDTO);
      } else if (line.trim() !== '') {
        //there was some string but couldn't parse it.
        console.error(`removing line: ${line}`);
        errorLines.push(line);
      }
    });

    return { chatReplyDTOs, errorLines };
  }

  getTimeAndChat(
    line: string,
    date: Date,
  ): { timeToSend: Date; chats: string[] } {
    const chats = [];
    const timeToSend = new Date(date);
    const cleanedLine = line.trim().replace(/^\-/, '').trim();
    const [hourPart, minutePart, content] = cleanedLine
      .split(':')
      .map((s) => s.trim());
    //changes time to utc format
    this.setTimetoSend(timeToSend, hourPart, minutePart);
    //parse the content by ?!., and split into chats
    this.parseContentTOChat(chats, content);

    return { timeToSend, chats };
  }

  parseContentTOChat(chats: string[], content: string): void {
    //this is where the actual content is split.
    //It is split by
    //1. having none .?!, characters at front and
    //2. ending with one or multiple .?!, characters
    const splitContent = content.match(/[^.?!,]+[.?!,♪]+/g) || [];
    splitContent.forEach((contentPart) => {
      contentPart = contentPart.trim();
      contentPart = contentPart.replace(
        /([,.])([♪.?!,]*)$/,
        (match, p1, p2) => {
          // If there's more than one punctuation mark at the end (p2 is not empty), keep all.
          // Otherwise, remove the single '.' or ',' (p1).
          return p2 ? match : p2;
        },
      );

      chats.push(contentPart);
    });
  }

  private getMonthAndDay(line: string): Date {
    const currentYear = new Date().getFullYear();

    const dateParts = line
      .match(/\d+월 \d+일/)[0]
      .replace('월 ', '-')
      .replace('일', '')
      .split('-');

    const timeToSend = new Date(
      `${currentYear}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`,
    );
    return timeToSend;
  }

  async changeBufferToReadableStrings(buffer: Buffer): Promise<string[]> {
    const lines: string[] = [];
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      lines.push(line);
    }

    return lines;
  }
}
