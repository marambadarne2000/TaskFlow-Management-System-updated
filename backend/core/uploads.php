<?php
// בודק קבצים לפי גודל, סיומת וסוג התוכן האמיתי
declare(strict_types=1);

function validate_upload(array $file, array $allowedTypes, int $maximumBytes): array
{
    if (($file["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        out(["error" => "העלאת הקובץ נכשלה"], 422);
    }

    $size = (int) ($file["size"] ?? 0);
    if ($size <= 0 || $size > $maximumBytes) {
        out(["error" => "הקובץ ריק או גדול מהמותר"], 422);
    }

    $extension = strtolower(pathinfo((string) ($file["name"] ?? ""), PATHINFO_EXTENSION));
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file((string) $file["tmp_name"]);
    $allowedMimes = $allowedTypes[$extension] ?? [];

    if (!$allowedMimes || !in_array($mime, $allowedMimes, true)) {
        out(["error" => "סוג הקובץ אינו נתמך או שתוכן הקובץ אינו מתאים לסיומת"], 422);
    }

    return [$extension, $mime];
}

function safe_original_name(string $name): string
{
    $name = preg_replace('/[^\pL\pN._ -]/u', "_", basename($name)) ?: "file";
    return mb_substr($name, 0, 150);
}
