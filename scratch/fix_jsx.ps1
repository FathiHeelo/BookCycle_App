$path = 'c:\Users\asus\BookCycle_App\BookCycle_App\app\book-details\[id].tsx'
$content = Get-Content -LiteralPath $path
$newContent = $content[0..288] + $content[293..($content.Length-1)]
Set-Content -LiteralPath $path -Value $newContent
