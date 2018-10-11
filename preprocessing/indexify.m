% run in 'preprocessing' directory
% for 'favicon', 'birdramon', and 'hina' bases

imdir = 'img/';
newimdir = '../img/';
base = 'favicon';

if strcmp(base, 'birdramon') || strcmp(base, 'hina')
    colors = 64;
else
    colors = 4;
end
dither_opt = 'nodither';

mkdir('../img');

[im, map] = imread(['img/', base, '.png']);
[newim, newmap] = im2ind(im, map, colors, dither_opt);
if strcmp(base, 'birdramon') || strcmp(base, 'hina')
    imwrite(newim, newmap, ['../img/', base, '.png'], 'Transparency', 0);
else
    imwrite(newim, newmap, ['../img/', base, '.png']);
end

function [newim, newmap] = im2ind(im, map, n, dither_opt)
    if size(map) > 0
        [newim, newmap] = imapprox(im, map, n, dither_opt);
    else
        [newim, newmap] = rgb2ind(im, n, dither_opt);
    end
end
