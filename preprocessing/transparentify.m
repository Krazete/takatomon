% useful only for bichrome images
% run in a copy of preprocessing/img/tribe

% change to and rerun for each image base name
tribe = 'mirage';

im = imread([tribe, '.png']);

% get color frequency information
R = histcounts(im(:, :, 1), 0:256);
G = histcounts(im(:, :, 2), 0:256);
B = histcounts(im(:, :, 3), 0:256);

sortedR = sortrows([R; 0:255]', 'descend');
sortedG = sortrows([G; 0:255]', 'descend');
sortedB = sortrows([B; 0:255]', 'descend');

sortedR(sortedR(:, 1) == 0, 2) = sortedR(1, 2);
sortedG(sortedG(:, 1) == 0, 2) = sortedG(1, 2);
sortedB(sortedB(:, 1) == 0, 2) = sortedB(1, 2);

% get most common color
backcolor = im;
backcolor(:, :, 1) = sortedR(1, 2);
backcolor(:, :, 2) = sortedG(1, 2);
backcolor(:, :, 3) = sortedB(1, 2);

% get second most common color
forecolor = im;
forecolor(:, :, 1) = sortedR(2, 2);
forecolor(:, :, 2) = sortedG(2, 2);
forecolor(:, :, 3) = sortedB(2, 2);

% make mask based on most common color
diffcolor = uint8(abs(double(im) - double(backcolor)));
background = max(diffcolor, [], 3);

% create monochrome image of second most common color and apply mask
imwrite(forecolor, [tribe, '.png'], 'Alpha', background);

% debugging
imshow([backcolor, forecolor, gray2rgb(background)]);

function rgb = gray2rgb(gray)
    rgb = cat(3, gray, gray, gray);
end
