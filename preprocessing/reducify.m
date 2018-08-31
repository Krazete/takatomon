% run in 'preprocessing' directory
% change subdir and rerun for 'icons', 'mon', and 'mon' subdirectories

imdir = 'img/';
newimdir = '../img/';
subdir = 'mon/';

colors = 64;
dither_option = 'nodither';

mkdir([newimdir, subdir]);

files = dir([imdir, subdir]);
N = length(files);
for n = 1:N
    file = files(n);
    if contains(file.name, '.png')
        [im, map] = imread([imdir, subdir, file.name]);
        newname = [newimdir, subdir, file.name];
        if strcmp(subdir, 'icons/') || strcmp([subdir, file.name], 'mon/none.png')
            [newim, newmap] = im2ind(im, map, 8, dither_option);
        else
            [newim, newmap] = im2ind(im, map, colors, dither_option);
        end
        if strcmp([subdir, file.name], 'mon/birdramon.png')
            imwrite(newim, newmap, newname, 'Transparency', 0);
        else
            imwrite(newim, newmap, newname);
        end
    end
end

function [newim, newmap] = im2ind(im, map, n, dither_option)
    if size(map) > 0
        [newim, newmap] = imapprox(im, map, n, dither_option);
    else
        [newim, newmap] = rgb2ind(im, n, dither_option);
    end
end
