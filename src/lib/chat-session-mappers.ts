import type { Message, MessageAttachment, StoredAttachment, StoredMessage } from '@/types';

const IMAGE_FILE_NAME_RE = /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?|$)/i;

function isImageAttachment(attachment: Pick<StoredAttachment, 'name' | 'type'>): boolean {
  return attachment.type.startsWith('image/') || IMAGE_FILE_NAME_RE.test(attachment.name);
}

export function storedAttachmentToMessageAttachment(
  attachment: StoredAttachment
): MessageAttachment {
  return {
    name: attachment.name,
    size: attachment.size,
    previewUrl:
      attachment.blob && isImageAttachment(attachment)
        ? URL.createObjectURL(attachment.blob)
        : null,
    type: attachment.type,
    blob: attachment.blob,
  };
}

export function messageAttachmentToStoredAttachment(
  attachment: MessageAttachment
): StoredAttachment {
  return {
    name: attachment.name,
    size: attachment.size,
    type: attachment.type ?? attachment.blob?.type ?? '',
    blob: attachment.blob ?? null,
  };
}

export function storedMessageToMessage(message: StoredMessage): Message {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
    suggestions: message.suggestions ? [...message.suggestions] : undefined,
    attachments: message.attachments?.map(storedAttachmentToMessageAttachment),
    versions: message.versions?.map((version) => ({ ...version })),
    activeVersionIndex: message.activeVersionIndex,
  };
}

export function messageToStoredMessage(message: Message): StoredMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
    suggestions: message.suggestions ? [...message.suggestions] : undefined,
    attachments: message.attachments?.map(messageAttachmentToStoredAttachment),
    versions: message.versions?.map((version) => ({ ...version })),
    activeVersionIndex: message.activeVersionIndex,
  };
}

export function storedMessagesToMessages(messages: StoredMessage[]): Message[] {
  return messages.map(storedMessageToMessage);
}

export function messagesToStoredMessages(messages: Message[]): StoredMessage[] {
  return messages.map(messageToStoredMessage);
}
