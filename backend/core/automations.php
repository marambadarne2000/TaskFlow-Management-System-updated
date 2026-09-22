<?php
// בודק אם חוק אוטומציה מסוים פעיל במסד הנתונים
declare(strict_types=1);

function automation_enabled(string $id): bool
{
    $query = db()->prepare("SELECT enabled FROM automation_rules WHERE id=?");
    $query->execute([$id]);
    return (int) $query->fetchColumn() === 1;
}
