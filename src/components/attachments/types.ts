/** One attached file and its object URL for preview (revoked on remove). */
export interface AttachedFile {
  file: File;
  previewUrl: string | null;
}
