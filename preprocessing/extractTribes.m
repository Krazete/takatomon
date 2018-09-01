% run in 'preprocessing' directory

im = imread('img/tribes.png');
im(:, 1028, :) = 0;

size = 135;
gaps = [0, 13, 14, 14, 13, 14, 15];
padding = 8;
newsize = 130;

tribes = {'mirage', 'blazing', 'glacier', 'earth', 'electric', 'abyss', 'bright'};
colors = [
    15, 15, 15; % #eee
    16,  0,  0; % #f00
     0, 10, 16; % #0af
     4, 11,  4; % #4a4
    16, 16,  0; % #ff0
    16,  2,  9; % #f29
    16, 14,  0  % #fd0
] / 16;

mkdir('../img/tribes/');
for x = 1:7
    name = sprintf('../img/tribes/%s.png', tribes{x});
    ya = 57;
    yb = ya + size;
    xa = (x - 1) * size + sum(gaps(1:x)) + 1;
    xb = xa + 135 - 1;
    rgb = im(ya:yb, xa:xb, :);
    padded = rgb(padding:size - padding, padding:size - padding, :);
    scaledrgb = imresize(padded, [newsize, newsize]);
    tribe = rgb2ind(scaledrgb, 2, 'nodither');
    if x == 7
        tribe = 1 - tribe;
    end
    imwrite(tribe, [0, 0, 0; colors(x, :)], name, 'Transparency', 0);
end
