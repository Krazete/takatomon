% run in 'preprocessing' directory

bases = {'physical', 'magical'};
mkdir('../img/skill');
x = 253;
y = 312;
d = 80;

for i = 1:2
    base = bases{i};
    im = imread(['img/', base, '.png']);
    cropped = im(y + 1:y + d, x + 1:x + d, :);
    cropped(1:d, d/2 + 1:d, :) = cropped(1:d, d/2:-1:1, :);
    scaled = imresize(cropped, [130, 130]);
    [ind, map] = rgb2ind(scaled, 2, 'nodither');
    imwrite(ind, map, ['../img/skill/', base, '.png'], 'Transparency', 0);
end
